import { Component, OnInit } from '@angular/core';
import { Guid } from "@shared/helpers/guid";
import { NotificationService, ModalViewComponent, DialogRef } from "@aerum/ui";
import { SwapToken, SwapMode } from '@swap/models/models';
import { LoggerService } from "@core/general/logger-service/logger.service";
import { AuthenticationService } from '@core/authentication/authentication-service/authentication.service';
import { AerumNameService } from '@core/aens/aerum-name-service/aerum-name.service';
import { ERC20TokenService } from '@core/swap/on-chain/erc20-token-service/erc20-token.service';
import { AeroToErc20SwapService } from '@core/swap/on-chain/aero-to-erc20-swap-service/aero-to-erc20-swap.service';
import { Erc20ToAeroSwapService } from '@core/swap/on-chain/erc20-to-aero-swap-service/erc20-to-aero-swap.service';
import { Erc20ToErc20SwapService } from '@core/swap/on-chain/erc20-to-erc20-swap-service/erc20-to-erc20-swap.service';
import { TranslateService } from "@ngx-translate/core";

export class CreateSwapModalContext {
  swapId: string;
  token: SwapToken;
  tokenAmount: number;
  counterpartyAddress: string;
  counterpartyToken: SwapToken;
  counterpartyTokenAmount: number;
  rate: number;
  mode: SwapMode;
  currentAddress: string;
}

@Component({
  selector: 'create-swap',
  templateUrl: './create-swap.component.html',
  styleUrls: ['./create-swap.component.scss']
})
export class CreateSwapComponent implements ModalViewComponent<any, any>, OnInit {

  currentAddress: string;

  swapId: string;
  token: SwapToken;
  tokenAmount: number;
  counterpartyAddress: string;
  counterpartyToken: SwapToken;
  counterpartyTokenAmount: number;
  rate: number;

  mode: SwapMode;
  title: string;
  processing = false;

  constructor(
    public dialogRef: DialogRef<any,any>,
    private logger: LoggerService,
    private authService: AuthenticationService,
    private notificationService: NotificationService,
    private erc20TokenService: ERC20TokenService,
    private aeroToErc20SwapService: AeroToErc20SwapService,
    private erc20ToAeroSwapService: Erc20ToAeroSwapService,
    private erc20ToErc20SwapService: Erc20ToErc20SwapService,
    private aensService: AerumNameService,
    private translateService: TranslateService,
  ) { }

  async ngOnInit() {
    const keystore = this.authService.getKeystore();
    this.currentAddress = "0x" + keystore.address;

    this.generateSwapId();
    this.tokenAmount = 0.01;

    this.token = { symbol: 'GAS', address: '' };

    this.updateSwapMode();
    this.updateTitle();

    // TODO: We may want some other values here
    this.counterpartyAddress = this.currentAddress;
    this.counterpartyTokenAmount = 10;
    this.recalculateTokenRate();
  }

  generateSwapId() {
    const prefix = this.getSwapIdPrefix();
    const randomPart = Guid.newGuid().replace(/-/g, '').slice(prefix.length);
    this.swapId = prefix + randomPart;
  }

  recalculateTokenRate() {
    const counterpartyTokenAmount = Number(this.counterpartyTokenAmount);
    if (!counterpartyTokenAmount || counterpartyTokenAmount <= 0) {
      return;
    }
    this.rate = Number(this.tokenAmount) / counterpartyTokenAmount;
  }

  recalculateCounterpartyTokenAmount() {
    const rate = Number(this.rate);
    if (!rate || rate <= 0) {
      return;
    }
    this.counterpartyTokenAmount = Number(this.tokenAmount) / rate;
  }

  onTokenChanged(token: SwapToken) {
    const oldMode = this.mode;
    this.token = token;
    this.updateSwapMode();
    this.updateTitle();
    if (oldMode !== this.mode) {
      this.generateSwapId();
    }
  }

  onCounterpartyTokenChanged(token: SwapToken) {
    const oldMode = this.mode;
    this.counterpartyToken = token;
    this.updateSwapMode();
    this.updateTitle();
    if (oldMode !== this.mode) {
      this.generateSwapId();
    }
  }

  async createSwap() {
    const tokenAmountParsed = Number(this.tokenAmount);
    const counterpartyTokenAmountParsed = Number(this.counterpartyTokenAmount);
    const rateParsed = Number(this.rate);

    if ((!tokenAmountParsed || tokenAmountParsed <= 0) ||
      (!counterpartyTokenAmountParsed || counterpartyTokenAmountParsed <= 0) ||
      (!rateParsed || rateParsed <= 0)) {
      this.notificationService.notify(this.translate('ERROR'), this.translate('SWAP.CREATE.SWAP_AMOUNT_OR_RATE_NOT_VALID'), "aerum", 3000);
      return;
    }

    if (this.mode === 'aero_to_aero') {
      this.notificationService.notify(this.translate('ERROR'), this.translate('SWAP.CREATE.GAS_GAS_SWAPS_ARE_NOT_SUPPORTED'), "aerum", 3000);
      return;
    }

    // TODO: Replace with better validation
    if (!this.counterpartyToken) {
      this.notificationService.notify(this.translate('ERROR'), this.translate('SWAP.CREATE.PLEASE_SELECT_COUNTERPARTY_TOKEN'), "aerum", 3000);
      return;
    }

    try {
      this.startLoading();
      await this.confirmAndCreateSwap();
    } catch (e) {
      this.notificationService.notify(this.translate('ERROR'), this.translate('SWAP.CREATE.UNKNOWN_ERROR_OCCURED'), "aerum", 3000);
      this.logger.logError('Swap creation error:', e);
    } finally {
      this.stopLoading();
    }
  }

  private async confirmAndCreateSwap() {
    this.counterpartyAddress = this.counterpartyAddress.replace(/\s+/g, '');
    this.counterpartyAddress = await this.aensService.safeResolveNameOrAddress(this.counterpartyAddress);
    this.dialogRef.close({
      swapId: this.swapId,
      token: this.token,
      tokenAmount: this.tokenAmount,
      counterpartyAddress: this.counterpartyAddress,
      counterpartyToken: this.counterpartyToken,
      counterpartyTokenAmount: this.counterpartyTokenAmount,
      rate: this.rate,
      mode: this.mode,
      currentAddress: this.currentAddress
    });
    // const modalResult = await this.modalService.openSwapCreateConfirm({
    //   swapId: this.swapId,
    //   token: this.token,
    //   tokenAmount: this.tokenAmount,
    //   counterpartyAddress: this.counterpartyAddress,
    //   counterpartyToken: this.counterpartyToken,
    //   counterpartyTokenAmount: this.counterpartyTokenAmount,
    //   rate: this.rate
    // });
  }

  private updateSwapMode() {
    this.mode = this.recalculateSwapMode();
  }

  private recalculateSwapMode(): SwapMode {
    if (this.isAeroInOpenSelected()) {
      if (this.isAeroInCounterpartySelected()) {
        // NOTE: not supported swap mode aero to aero
        return 'aero_to_aero';
      } else {
        return 'aero_to_erc20';
      }
    } else {
      if (this.isAeroInCounterpartySelected()) {
        return 'erc20_to_aero';
      } else {
        return 'erc20_to_erc20';
      }
    }
  }

  private isAeroInOpenSelected() {
    return this.isAeroSelected(this.token);
  }

  private isAeroInCounterpartySelected() {
    return this.isAeroSelected(this.counterpartyToken);
  }

  private isAeroSelected(token: SwapToken) {
    return token && !token.address;
  }

  private updateTitle() {
    switch (this.mode) {
      case 'aero_to_erc20': {
        this.title = 'SWAP.AERO_TO_TOKEN';
        break;
      }
      case 'erc20_to_aero': {
        this.title = 'SWAP.TOKEN_TO_AERO';
        break;
      }
      case 'erc20_to_erc20': {
        this.title = 'SWAP.TOKEN_TO_TOKEN';
        break;
      }
      case 'aero_to_aero': {
        this.title = 'SWAP.AERO_TO_AERO';
        break;
      }
      default: { }
    }
  }

  private getSwapIdPrefix() {
    switch (this.mode) {
      case 'aero_to_erc20': return 'a2e';
      case 'erc20_to_aero': return 'e2a';
      case 'erc20_to_erc20': return 'e2e';
      case 'aero_to_aero': return 'a2a';
      default: return 'a2e';
    }
  }

  private startLoading() {
    this.processing = true;
  }

  private stopLoading() {
    this.processing = false;
  }

  private translate(key: string): string {
    return this.translateService.instant(key);
  }
}
