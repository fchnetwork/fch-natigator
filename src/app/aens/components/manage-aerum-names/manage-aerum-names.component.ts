import { Component, OnInit } from '@angular/core';
import { NotificationService } from '@aerum/ui';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { ModalService } from '@app/shared/services/modal.service';
import { AuthenticationService } from '@app/account/services/authentication-service/authentication.service';
import { BuyConfirmRequest } from '@app/aens/models/buyConfirmRequest';
import { BuyConfirmReponse } from '@app/aens/models/buyConfirmReponse';

@Component({
  selector: 'app-manage-aerum-names',
  templateUrl: './manage-aerum-names.component.html',
  styleUrls: ['./manage-aerum-names.component.scss']
})
export class ManageAerumNamesComponent implements OnInit {

  name: string;
  nameToBuy: string;
  account: string;

  price: number;
  nameFound: boolean;
  nameAvailable: boolean;
  processing: boolean;

  isOwner: boolean;

  checkForm: FormGroup;
  buyForm: FormGroup;

  constructor(
    private authService: AuthenticationService,
    private modalService: ModalService,
    private notificationService: NotificationService,
    private translateService: TranslateService,
    private formBuilder: FormBuilder
  ) 
    { }

  ngOnInit() {
    const keystore = this.authService.getKeystore();
    this.account  = "0x" + keystore.address;

    // TODO: Test code. Remove later
    this.name = 'asrcrypto';
    this.price = 0.01;
    this.isOwner = true;

    this.checkForm = this.formBuilder.group({
      name: [null, [Validators.pattern("^[a-zA-Z0-9_-]{5,50}$")]],
    });

    this.buyForm = this.formBuilder.group({
      name: [null, [Validators.pattern("^[a-zA-Z0-9_-]{5,50}$")]],
      account: [null, [Validators.required, Validators.pattern("^(0x){1}[0-9a-fA-F]{40}$")]]
    });
  }

  async checkName() {
    if(!this.canCheckName()) {
      console.log(`${this.name} is invalid name or other thing in proggress`);
      return;
    }

    try {
      this.startProcessing();
      await this.tryCheckName();
    } catch (e) {
      this.notificationService.notify(this.translate('ENS.UNHANDLED_ERROR'), `${this.translate('ENS.CHECK_NAME_ERROR')}: ${this.name}.aer`, 'aerum', 5000);
      throw e;
    }
    finally{
      this.stopProcessing();
    }
  }

  async tryCheckName() {
    await this.timeout(1000);

    // TODO: Test code. Remove later
    this.nameFound = true;
    this.nameAvailable = !this.nameAvailable;
    this.nameToBuy = this.name;
  }

  async buyName() {
    if(!this.canBuyName()) {
      console.log('Buy form is invalid or other thing in proggress');
      return;
    }

    try {
      this.startProcessing();
      await this.tryBuyName();
    } catch (e) {
      this.notificationService.notify(this.translate('ENS.UNHANDLED_ERROR'), `${this.translate('ENS.BUY_NAME_ERROR')}: ${this.nameToBuy}.aer`, 'aerum', 5000);
      throw e;
    }
    finally{
      this.stopProcessing();
    }
  }

  async tryBuyName() {
    // TODO: Test code here. Remove later
    const buyRequest: BuyConfirmRequest = {
      name: this.nameToBuy.trim() + '.aer',
      amount: this.price,
      buyer: this.account,
      ansOwner: this.account,
      gasPrice: 1000 * 1000 * 1000,
      estimatedFeeInGas: 200 * 1000,
      maximumFeeInGas: 220 * 1000 
    };
    const modalResult: BuyConfirmReponse = await this.modalService.openBuyAensConfirm(buyRequest);
    if(!modalResult.accepted) {
      console.log('Name buy cancelled');
      return;
    }

    this.notificationService.notify(this.translate('ENS.OPERATION_STARTED_TITLE'), this.translate('ENS.OPERATION_IN_PROGRESS'), 'aerum', 3000);
    // TODO: buy
    await this.timeout(2000);
    this.notificationService.notify(this.translate('ENS.NAME_BUY_SUCCESS_TITLE'), `${this.translate('ENS.NAME_BUY_SUCCESS')}: ${this.nameToBuy}.aer`, 'aerum');
  }

  hasError(control: FormControl) {
    if(!control) {
      return false;
    }

    return !control.valid && control.touched;
  }

  canCheckName() {
    return !this.processing && this.checkForm.valid;
  }

  canBuyName() {
    return !this.processing && this.buyForm.valid && this.nameAvailable;
  }

  private startProcessing() {
    this.processing = true;
  }

  private stopProcessing() {
    this.processing = false;
  }

  private translate(key: string) {
    return this.translateService.instant(key);
  }

  // TODO: Test method
  private timeout(time: number) : Promise<number> {
    return new Promise((resolve) => setTimeout(() => resolve(time), time));
  }
}