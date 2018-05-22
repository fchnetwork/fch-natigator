import { TestBed, inject } from '@angular/core/testing';

import Web3 from "web3";
import { Erc20ToAeroSwapService } from './erc20-to-aero-swap.service';
import { AuthenticationService } from "@app/core/authentication/authentication-service/authentication.service";
import { ContractExecutorService } from "@app/core/contract/contract-executor.service";

describe('Erc20ToAeroSwapService', () => {
  const authService: Partial<AuthenticationService> = {
    initWeb3: () => ({ eth: { Contract: () => { } } } as any as Web3)
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Erc20ToAeroSwapService,
        { provide: AuthenticationService, useValue: authService },
        { provide: ContractExecutorService, useValue: jest.fn() }
      ]
    });
  });

  it('should be created', inject([Erc20ToAeroSwapService], (service: Erc20ToAeroSwapService) => {
    expect(service).toBeTruthy();
  }));
});
