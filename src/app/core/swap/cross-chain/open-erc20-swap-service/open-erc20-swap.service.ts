const artifacts = require('@core/abi/OpenAtomicSwapERC20.json');
const erc20ABI = require('@core/abi/tokens.ts');
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { EnvironmentService } from "@core/general/environment-service/environment.service";
import { secondsToDate } from "@shared/helpers/date-util";
import { fromSolidityDecimalString } from "@shared/helpers/number-utils";

import { toBigNumberString } from "@shared/helpers/number-utils";
import { TransactionOptions } from "@core/ethereum/base-contract-service/transaction-options.model";
import { BaseContractService } from "@core/ethereum/base-contract-service/base-contract.service";
import { EthereumAuthenticationService } from "@core/ethereum/ethereum-authentication-service/ethereum-authentication.service";
import { EthereumContractExecutorService } from "@core/ethereum/ethereum-contract-executor-service/ethereum-contract-executor.service";
import { InjectedWeb3ContractExecutorService } from "@core/ethereum/injected-web3-contract-executor-service/injected-web3-contract-executor.service";
import { InternalNotificationService } from "@core/general/internal-notification-service/internal-notification.service";
import { OpenErc20Swap } from "@core/swap/models/open-erc20-swap.model";
import { EthereumTokenService } from "@core/ethereum/ethereum-token-service/ethereum-token.service";
import { EthWalletType } from '@app/external/models/eth-wallet-type.enum';

@Injectable()
export class OpenErc20SwapService extends BaseContractService {
  private environment: EnvironmentService;

  constructor(
    notificationService: InternalNotificationService,
    ethereumAuthService: EthereumAuthenticationService,
    ethereumContractExecutorService: EthereumContractExecutorService,
    injectedWeb3ContractExecutorService: InjectedWeb3ContractExecutorService,
    private ethereumTokenService: EthereumTokenService,
    translateService: TranslateService,
    environment: EnvironmentService
  ) {
    super(
      artifacts.abi,
      environment.get().contracts.swap.crossChain.address.ethereum.OpenErc20Swap,
      notificationService,
      ethereumAuthService,
      ethereumContractExecutorService,
      injectedWeb3ContractExecutorService,
      translateService
    );
    this.environment = environment;
  }

  /**
   * Opens a swap
   * @param {string} hash - hash of the swap
   * @param {string} erc20Value - amount of ERC20 tokens
   * @param {string} erc20Address - address of ERC20 token contract
   * @param {string} withdrawTrader - address of counter partner trader
   * @param {number} timelock - time within, funds will be locked
   * @param {TransactionOptions} options - options for web3 contract method call
   */
  async openSwap(hash: string, erc20Value: string, erc20Address: string, withdrawTrader: string, timelock: number, options: TransactionOptions) {
    await this.tokenApprove(erc20Address, erc20Value, options);
    const contract = await this.createContract(options.wallet);
    const openSwap = contract.methods.open(hash, erc20Value, erc20Address, withdrawTrader, toBigNumberString(timelock));
    const receipt = await this.send(openSwap, options);
    return receipt;
  }

  /**
   * Approves funds in ERC20 token for open erc20 contract
   * @param {string} erc20Address - ERC20 token address
   * @param {string} value - amount of ERC20 tokens
   * @param {TransactionOptions} options - options for web3 contract method call
   */
  private async tokenApprove(erc20Address: string, value: string, options: TransactionOptions) {
    const openErc20Swap = this.environment.get().contracts.swap.crossChain.address.ethereum.OpenErc20Swap as string;
    const web3 = await this.createWeb3(options.wallet);
    const tokenContract = new web3.eth.Contract(erc20ABI.tokensABI, erc20Address);
    const approve = tokenContract.methods.approve(openErc20Swap, value);
    await this.send(approve, { wallet: options.wallet, account: options.account, hashCallback: options.approveCallback });
  }

  /**
   * Expires a swap in open erc20 contract
   * @param {string} hash - hash of the swap
   * @param {TransactionOptions} options - options for web3 contract method call
   */
  async expireSwap(hash: string, options: TransactionOptions) {
    const contract = await this.createContract(options.wallet);
    const expireSwap = contract.methods.expire(hash);
    const receipt = await this.send(expireSwap, options);
    return receipt;
  }

  /**
   * Checks and returns information about swap
   * @param {string} hash - hash of the swap
   * @return {OpenErc20Swap} Swap object
   */
  async checkSwap(hash: string): Promise<OpenErc20Swap> {
    const contract = await this.createContract();
    const checkSwap = contract.methods.check(hash);
    const response = await this.call(checkSwap);
    const token = await this.ethereumTokenService.getSaveTokensInfo(EthWalletType.Imported, response.erc20ContractAddress);
    const swap: OpenErc20Swap = {
      hash,
      openTrader: response.openTrader,
      withdrawTrader: response.withdrawTrader,
      erc20Value: fromSolidityDecimalString(response.erc20Value, token.decimals),
      erc20ContractAddress: response.erc20ContractAddress,
      erc20Token: token,
      timelock: response.timelock,
      openedOn: secondsToDate(Number(response.openedOn)),
      state: Number(response.state)
    };
    return swap;
  }

  /**
   * Returns list of swap ids for specified account
   * @param {string} address - account address
   * @return {string[]} List of swap ids
   */
  async getAccountSwapIds(address: string): Promise<string[]> {
    const contract = await this.createContract();
    const getAccountSwaps = contract.methods.getAccountSwaps(address);
    const swapIds = await this.call(getAccountSwaps, address);
    return swapIds;
  }

}

