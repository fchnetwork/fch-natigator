import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { InternalNotificationService } from '@app/core/general/internal-notification-service/internal-notification.service';
import { TokenService } from '@app/core/transactions/token-service/token.service';
import { AddressValidator } from "@shared/validators/address.validator";
import { AerumNameService } from "@core/aens/aerum-name-service/aerum-name.service";
import { ModalViewComponent, DialogRef } from '@aerum/ui';
import { StorageService } from "@core/general/storage-service/storage.service";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-token',
  templateUrl: './add-token.component.html',
  styleUrls: ['./add-token.component.scss']
})
export class AddTokenComponent implements ModalViewComponent<any, any>, OnInit {
  addTokenForm: FormGroup = this.formBuilder.group({});
  tokenAddress: any;
  tokenSymbol: any;
  decimals: any;
  totalSupply: any;
  balance: any;

  constructor(
    public dialogRef: DialogRef<any, any>,
    public formBuilder: FormBuilder,
    private tokenService: TokenService,
    public notificationService: InternalNotificationService,
    private aerumNameService: AerumNameService,
    private storageService: StorageService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.addTokenForm = this.formBuilder.group({
      tokenAddress: [ null, [], [new AddressValidator(this.aerumNameService).isAddressOrAensName]],
      tokenSymbol: [ null, [Validators.required, Validators.minLength(2)]],
      decimals: [ null, [Validators.required]]
    });

    this.addTokenForm.controls['tokenAddress'].valueChanges.subscribe( async (res) => {
      const resolvedAddress = await this.aerumNameService.resolveNameOrAddress(res);
      await this.getTokenInfo(resolvedAddress);
    });
  }

  validateTokens() {
    const tokens = this.storageService.getSessionData('tokens') || [];
    if(tokens.length) {
      // TODO: handle errors in any styled component
      for(let i = 0; i < tokens.length; i++) {
        if(this.totalSupply <= 0 || !Number.isInteger(this.totalSupply)) {
          this.notificationService.showMessage(this.translateService.instant('DASHBOARD_ADD_TOKEN.TOKENS_SUPPLY_HAS_O_BE_BIGGER_THAN_0'), this.translateService.instant('ERROR'));
          return false;
        } else if (this.addTokenForm.value.tokenAddress === tokens[i].address) {
          this.notificationService.showMessage(this.translateService.instant('DASHBOARD_ADD_TOKEN.YOU_CANNOT_ADD_TOKEN_WITH_THE_SAME_TOKEN_ADDRESS'), this.translateService.instant('ERROR'));
          return false;
        }
      }
    }
    return true;
  }

  async onSubmit() {
    const validate = this.validateTokens();
    if (this.addTokenForm.valid && validate) {
      const token = {
        address: await this.aerumNameService.resolveNameOrAddress(this.addTokenForm.value.tokenAddress),
        symbol: this.addTokenForm.value.tokenSymbol,
        decimals: this.addTokenForm.value.decimals,
        balance: this.balance,
      };
      this.tokenService.addToken(token);
      this.dialogRef.dismiss();
    }
  }

  async getTokenInfo(address) {
    if(!address) {
      this.clearTokenData();
      return;
    }

    try {
      const resolvedAddress = await this.aerumNameService.resolveNameOrAddress(address);
      if(!resolvedAddress) {
        this.clearTokenData();
        return;
      }

      const res = await this.tokenService.getNetworkTokenInfo(resolvedAddress);
      this.fillTokenData(res);
    } catch (e) {
      this.clearTokenData();
    }
  }

  private fillTokenData(data: any) {
    this.tokenSymbol = data.symbol;
    this.decimals = data.decimals;
    this.balance = data.balance;
    this.totalSupply = Number(data.totalSupply) || 0;
  }

  private clearTokenData() {
    this.tokenSymbol = '';
    this.decimals = null;
    this.balance = 0;
    this.totalSupply = 0;
  }
}
