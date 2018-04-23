import { DialogRef } from 'ngx-modialog';
import { BasicModalContext } from '@shared/components/modals/basic-modal/basic-modal.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalComponent } from 'ngx-modialog';
import { Component, OnInit } from '@angular/core';
import { TokenService } from '@app/dashboard/services/token.service';

@Component({
  selector: 'app-add-token',
  templateUrl: './add-token.component.html',
  styleUrls: ['./add-token.component.scss']
})
export class AddTokenComponent implements ModalComponent<BasicModalContext>, OnInit {
  addTokenForm: FormGroup = this.formBuilder.group({});
  tokenAddress: any;
  tokenSymbol: any;
  decimals: any;

  constructor(
    public dialog: DialogRef<BasicModalContext>,
    public formBuilder: FormBuilder,
    private tokenService: TokenService,
  ) { }

  ngOnInit() {
    this.addTokenForm = this.formBuilder.group({
      // password: [ null, [Validators.required, Validators.minLength(10), PasswordValidator.number, PasswordValidator.upper, PasswordValidator.lower]],
      tokenAddress: [ null, [Validators.required, Validators.minLength(5)]],
      tokenSymbol: [ null, [Validators.required, Validators.minLength(2)]],
      decimals: [ null, [Validators.required]]
    });
    this.getTokenInfo();

    this.addTokenForm.controls['tokenAddress'].valueChanges.subscribe( (res) => {
      console.log(res);
      this.getTokenInfo(res);
    });

  }

  onSubmit() {
    if (this.addTokenForm.valid) {
      const token = {
        address: this.addTokenForm.value.tokenAddress,
        symbol: this.addTokenForm.value.tokenSymbol,
        decimals: this.addTokenForm.value.decimals
      };
      this.tokenService.addToken(token);
      this.dialog.dismiss();
    }
  }

  getTokenInfo(address) {
    // const address = "0x8414d0b6205d82100f694be759e40a16e31e8d40";
    const tokensInfo = this.tokenService.getTokensInfo(address).then(res=>{
      console.log(res);
      this.tokenSymbol = res.symbol;
      this.decimals = res.decimals;
    }).catch((err)=>{
      console.log(err);
    });
  }

}
