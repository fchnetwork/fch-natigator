import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../account/services/authentication-service/authentication.service';
import { TransactionServiceService } from '../services/transaction-service/transaction-service.service';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../shared/services/modal.service';
import { ClipboardService } from '../../shared/services/clipboard.service';
import { NotificationService } from '../../shared/services/notification.service';
import { SessionStorageService } from 'ngx-webstorage';
import { TokenService } from '@app/dashboard/services/token.service';

const Tx = require('ethereumjs-tx');
const ethJsUtil = require('ethereumjs-util');
const Web3 = require('web3');

declare var window: any;
 
@Component({
  selector: 'app-create-transaction',
  templateUrl: './create-transaction.component.html',
  styleUrls: ['./create-transaction.component.scss']
})
export class CreateTransactionComponent implements OnInit {

  backupKeystore: any;
  decryptKeystore: any;
  myBalance: any;
  theirBalance: any;

  privateKey: string;

  /* new fields */
  senderAddress: string;
  receiverAddress: string;
  amount = 0;
  transactions: any[];
  includedDataLength: number;
  walletBalance: number;
  aeroBalance: number;
  sendEverything: boolean;
  transactionMessage:any;
  addressQR: string;
  maxTransactionFee = 0;
  maxTransactionFeeEth = 0;
  totalAmount = 0;
  tokens: any;
  selectedToken = {
    symbol: 'AERO',
    address: null,
    balance: 0,
    decimals: null,
  };

  constructor(
    public authServ: AuthenticationService,
    private modalSrv: ModalService,
    private clipboardService: ClipboardService,
    private notificationService: NotificationService,
    public txnServ: TransactionServiceService,
    public sessionStorageService: SessionStorageService,
    private tokenService: TokenService,
   ) {
    this.userData();
    setInterval(()=>{
      this.userData();
    },3000);
    
   }


  ngOnInit() {
    this.walletBalance = this.myBalance;
    this.includedDataLength = 0;
    this.handleInputsChange();
    this.tokens = this.tokenService.getTokens();
  }

  copyToClipboard() {
    this.clipboardService.copy(this.senderAddress);
    this.notificationService.showMessage('Copied to clipboard!');
  }

  userData() {
      return this.authServ.showKeystore().then( 
        (keystore) => {

          const getBalance = this.txnServ.checkBalance(keystore.address);
          const getQR      = this.authServ.createQRcode( "0x" + keystore.address );  

          return Promise.all([ keystore, getBalance, getQR ]); 

      }
    )
      .then(
        ([ keystore, accBalance, qrCode ]) => {
        this.senderAddress = "0x" + keystore.address ;
        if(this.selectedToken.symbol === 'AERO') {
          this.walletBalance = accBalance;
        }
        this.aeroBalance = accBalance;
        this.addressQR     = qrCode;
      }
    );
  }

  getMaxTransactionFee() {
    if(this.receiverAddress) {
      this.txnServ.maxTransactionFee(this.receiverAddress, this.selectedToken.symbol === 'AERO' ? "aerum test transaction" : {type: 'token', contractAddress: this.selectedToken.address, amount: Number(this.amount * Math.pow(10,this.selectedToken.decimals))}).then(res=>{
        this.maxTransactionFee = res[0];
        this.maxTransactionFeeEth = res[1];
        this.getTotalAmount();
      }).catch((err)=>{
        console.log(err);
      });
    } else {
      this.maxTransactionFee = 0.000;
    }
  }

  setSendEverything(event) {
    if(event) {
      this.amount = Number(this.walletBalance) - Number(this.maxTransactionFeeEth);
    }
    this.sendEverything = event;
  }

  getTotalAmount() {
    if(this.receiverAddress) {
      this.totalAmount = this.selectedToken.symbol === 'AERO' ?  Number(this.amount) + Number(this.maxTransactionFeeEth) : Number(this.maxTransactionFeeEth);
    }
    else {
      this.totalAmount = 0;
    }
  }

  showMore() {}

  showTransactions() {}

  handleInputsChange() {
    this.getMaxTransactionFee();
    this.getTotalAmount();
  }

  handleSelectChange() {
    if(this.selectedToken.symbol === 'AERO') {
      this.walletBalance = this.aeroBalance;
    } else {
      this.walletBalance = this.selectedToken.balance;
    }
    this.getMaxTransactionFee();
    this.getTotalAmount();
  }

  send() {
    this.transactionMessage = "";
    if( this.receiverAddress === undefined || this.receiverAddress == null) {
      alert("You need to add a receiver address");  
      return false;      
    } else {
      this.txnServ.checkAddressCode(this.receiverAddress).then((res:any)=>{
        let message = null;
        if(res.length > 3) {
          message = "You are sending crypto to contract address";
        }
        this.modalSrv.openTransactionConfirm(message).then( result =>{ 
          if(result === true) {
            const privateKey = this.sessionStorageService.retrieve('private_key');
            const address = this.sessionStorageService.retrieve('acc_address');
    
            if(this.selectedToken.symbol === 'AERO') {
              this.txnServ.transaction( privateKey, address, this.receiverAddress, this.amount, "aerum test transaction" ).then( res => {
                this.transactionMessage = res;
              }).catch( error =>  console.log(error) );
            } else if(this.selectedToken.address) {
              this.tokenService.sendTokens(address, this.receiverAddress, Number(this.amount * Math.pow(10,this.selectedToken.decimals)), this.selectedToken.address);
            }
          }
        });
      });
    }
  }




}
