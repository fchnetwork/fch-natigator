import Web3 from 'web3';
import { Contract } from 'web3/types';

import { AuthenticationService } from '@core/authentication/authentication-service/authentication.service';
import { ContractExecutorService } from '@core/contract/contract-executor-service/contract-executor.service';

export abstract class BaseContractService {

  protected web3: Web3;
  protected contract: Contract;

  private eventsContract: Contract;

  protected constructor(
    protected abi: any[],
    protected address: string,
    protected authenticationService: AuthenticationService,
    protected contractExecutorService: ContractExecutorService
  ) {
    this.web3 = this.authenticationService.getWeb3();
    this.contract = new this.web3.eth.Contract(abi, address);
  }

  protected createEventsSupportingContract(): Contract {
    if(!this.eventsContract) {
      const wsWeb3 = this.authenticationService.getWSWeb3();
      this.eventsContract = new wsWeb3.eth.Contract(this.abi, this.address);
    }
    return this.eventsContract;
  }
}
