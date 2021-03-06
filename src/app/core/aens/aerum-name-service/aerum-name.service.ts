import { Injectable } from '@angular/core';

import { hash } from 'eth-ens-namehash';
import { sha3 } from 'web3-utils';
import Web3 from 'web3';

import { EnvironmentService } from "@core/general/environment-service/environment.service";
import { LoggerService } from '@core/general/logger-service/logger.service';
import { AuthenticationService } from '@core/authentication/authentication-service/authentication.service';
import { AensRegistryContractService } from '@core/aens/aens-registry-contract-service/aens-registry-contract.service';
import { AensFixedPriceRegistrarContractService } from '@core/aens/aens-fixed-price-registrar-contract-service/aens-fixed-price-registrar-contract.service';
import { AensPublicResolverContractService } from '@core/aens/aens-public-resolver-contract-service/aens-public-resolver-contract.service';
import { CheckStatus } from "./check-status.enum";

@Injectable()
export class AerumNameService {

  // NOTE: Next values are based on contract run observations + some randomness
  private readonly buyNameEstimatedGasUsage = 149201 + Math.floor((Math.random() * 10000));
  private readonly releaseNameEstimatedGasUsage = 95530 + Math.floor((Math.random() * 10000));
  private readonly transferNameEstimatedGasUsage = 66984 + Math.floor((Math.random() * 10000));
  private readonly twoOperationsGasThreshold = 3 * 100 * 1000;
  private readonly threeOperationsGasThreshold = 3 * 100 * 1000;

  private readonly emptyAddress = '0x0000000000000000000000000000000000000000';

  private readonly web3: Web3;

  constructor(
    private logger: LoggerService,
    private authService: AuthenticationService,
    private registryContractService: AensRegistryContractService,
    private registrarContractService: AensFixedPriceRegistrarContractService,
    private resolverContractService: AensPublicResolverContractService,
    private environment: EnvironmentService
  ) {
    this.web3 = this.authService.getWeb3();
  }

  isAensName(nameOrAddress: string): boolean {
    return nameOrAddress && nameOrAddress.endsWith('.f');
  }

  async safeResolveNameOrAddress(nameOrAddress: string) {
    try {
      const address = await this.resolveNameOrAddress(nameOrAddress);
      return address ? address.toLowerCase() : address;
    } catch (e) {
      this.logger.logMessage(`Resolve ${nameOrAddress} failed silently: ${e.message}`);
      return null;
    }
  }

  async resolveNameOrAddress(nameOrAddress: string) {
    if(!nameOrAddress) {
      return null;
    }

    if(this.isAensName(nameOrAddress)) {
      return this.resolveAddressFromName(nameOrAddress);
    }

    return nameOrAddress;
  }

  async resolveAddressFromName(name: string) : Promise<string> {
    this.ensureName(name);

    name = name.toLowerCase();
    const node = hash(name);
    const address = await this.resolverContractService.getAddress(node);
    this.logger.logMessage(`Name ${name} resolved into: ${address}`);
    if(address === this.emptyAddress) {
      return null;
    }

    return address || null;
  }

  async ensureNameCanBeResolved(name: string): Promise<boolean> {
    try {
      if(!name || !name.endsWith(".f")) {
        return false;
      }

      const address = await this.safeResolveNameOrAddress(name);
      return address && (address !== this.emptyAddress);
    } catch (e) {
      this.logger.logError(`Error resolving name: ${name}`, e);
      return false;
    }
  }

  async isNameAvailable(name: string) : Promise<boolean> {
    if(!name || !name.endsWith(".f")) {
      return false;
    }

    name = name.toLowerCase();
    const node = hash(name);
    const owner = await this.registryContractService.getOwner(node);

    return this.isEmptyAddress(owner);
  }

  async checkStatus(address: string, name: string) : Promise<CheckStatus> {
    this.ensureName(name);

    name = name.toLowerCase();
    const node = hash(name);
    const owner = await this.registryContractService.getOwner(node);

    if(this.isEmptyAddress(owner)) {
      return CheckStatus.Available;
    }

    if(this.addressEquals(owner, address)) {
      return CheckStatus.Owner;
    }

    return CheckStatus.NotAvailable;
  }

  async buyNameAndSetAddress(label: string, owner: string, address: string, priceInEther: string) {
    if(!label) {
      throw new Error('Can only buy not empty names');
    }

    label = label.toLowerCase();
    const name = label + ".f";
    const node = hash(name);
    const hashedLabel = sha3(label);

    if(!await this.isNodeOwner(node, owner)) {
      await this.registrarContractService.buy(hashedLabel, priceInEther);
    }
    await this.registryContractService.setResolver(node, this.environment.get().contracts.aens.address.PublicResolver);
    await this.resolverContractService.setAddress(node, address);
  }

  async estimateBuyNameAndSetAddressCost(label: string, owner: string, address: string, priceInEther: string) {
    if(!label) {
      throw new Error('Can only handle not empty names');
    }

    const gasPrice = await this.web3.eth.getGasPrice();
    return [Number(gasPrice), this.buyNameEstimatedGasUsage, this.buyNameEstimatedGasUsage + this.threeOperationsGasThreshold];
  }

  async buyName(label: string, owner: string, priceInEther: string) {
    if(!label) {
      throw new Error('Can only buy not empty names');
    }

    label = label.toLowerCase();
    const name = label + ".f";
    const node = hash(name);
    const hashedLabel = sha3(label);

    if(!await this.isNodeOwner(node, owner)) {
      await this.registrarContractService.buy(hashedLabel, priceInEther);
    }
  }

  async clearResolver(name: string) {
    await this.setResolver(name, this.emptyAddress);
  }

  async setFixedPriceResolver(name: string) {
    await this.setResolver(name, this.environment.get().contracts.aens.address.PublicResolver);
  }

  async setResolver(name: string, resolver: string) {
    this.ensureName(name);

    name = name.toLowerCase();
    const node = hash(name);
    await this.registryContractService.setResolver(node, resolver);
  }

  async cleanOwner(name: string) {
    await this.setOwner(name, this.emptyAddress);
  }

  async setOwner(name: string, owner: string) {
    this.ensureName(name);

    name = name.toLowerCase();
    const node = hash(name);
    await this.registryContractService.setOwner(node, owner);
  }

  async clearAddress(name: string) {
    await this.setAddress(name, this.emptyAddress);
  }

  async setAddress(name: string, address: string) {
    this.ensureName(name);

    name = name.toLowerCase();
    const node = hash(name);
    await this.resolverContractService.setAddress(node, address);
  }

  async estimateSetAddressCost(name: string, address: string) {
    this.ensureName(name);

    name = name.toLowerCase();
    const node = hash(name);
    return await this.resolverContractService.estimateSetAddressCost(node, address);
  }

  async estimateTransferNameCost(name: string) {
    this.ensureName(name);
    const gasPrice = await this.web3.eth.getGasPrice();
    return [Number(gasPrice), this.transferNameEstimatedGasUsage, this.transferNameEstimatedGasUsage + this.twoOperationsGasThreshold];
  }

  async estimateReleaseNameCost(name: string) {
    this.ensureName(name);
    const gasPrice = await this.web3.eth.getGasPrice();
    return [Number(gasPrice), this.releaseNameEstimatedGasUsage, this.releaseNameEstimatedGasUsage + this.threeOperationsGasThreshold];
  }

  async setPrice(priceInWei: string) {
    await this.registrarContractService.setPrice(priceInWei);
  }

  async getPrice() {
    return await this.registrarContractService.getPrice();
  }

  async getBalance() {
    return await this.registrarContractService.balance();
  }

  async withdraw(address: string, amountInWei: string) {
    await this.registrarContractService.withdraw(address, amountInWei);
  }

  async transferOwnership(to: string) {
    await this.registrarContractService.setOwner(to);
  }

  async isRegistrarOwner(address: string) {
    const owner = await this.registrarContractService.owner();
    return this.addressEquals(owner, address);
  }

  async isNodeOwner(node: string, address: string) {
    const owner = await this.registryContractService.getOwner(node);
    return this.addressEquals(owner, address);
  }

  private ensureName(name: string) {
    if(!name || !name.endsWith(".f")) {
      throw new Error('Can only handle names ending with .f');
    }
  }

  private isEmptyAddress(address: string) {
    return address === this.emptyAddress;
  }

  private addressEquals(one: string, two: string) {
    return one.toUpperCase() === two.toUpperCase();
  }
}
