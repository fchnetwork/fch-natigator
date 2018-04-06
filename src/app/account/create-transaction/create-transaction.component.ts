import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication-service/authentication.service';
import { TransactionServiceService } from '../services/transaction-service/transaction-service.service';
// import { ModalService } from '../../shared/services/modal.service';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../shared/services/modal.service';




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
  receiverAddress: any;
  amount: number;
  transactions: any[];
  includedDataLength: number;
  walletBalance: number;
  sendEverything: boolean;


  constructor(
    public authServ: AuthenticationService,
    private modalSrv: ModalService,
    public txnServ: TransactionServiceService ) {
    this.userData();
   }


  ngOnInit() {
    this.transactions = [
      {month: 'Feb', day: '22', eventType: 'Contract execution', senderAddress: 'Partnership Execution', receiverAddress: '3Pasdfawe56f5wae4f68', amount: 10.00},
      {month: 'Feb', day: '22', eventType: 'Contract execution', senderAddress: 'Partnership Execution', receiverAddress: '3Pasdfawe56f5wae4f68', amount: 155.10},
      {month: 'Feb', day: '22', eventType: 'Contract execution', senderAddress: 'Partnership Execution', receiverAddress: '3Pasdfawe56f5wae4f68', amount: 0.04165},
      {month: 'Feb', day: '22', eventType: 'Sent', senderAddress: 'Partnership Execution', receiverAddress: '3Pasdfawe56f5wae4f68', amount: -1.00},
      {month: 'Feb', day: '22', eventType: 'Sent', senderAddress: 'Partnership Execution', receiverAddress: '3Pasdfawe56f5wae4f68', amount: -51.00},
      {month: 'Feb', day: '22', eventType: 'Contract execution', senderAddress: 'Partnership Execution', receiverAddress: '3Pasdfawe56f5wae4f68', amount: 1.00},
      {month: 'Feb', day: '22', eventType: 'Contract execution', senderAddress: 'Partnership Execution', receiverAddress: '3Pasdfawe56f5wae4f68', amount: 1.00},
      {month: 'Feb', day: '22', eventType: 'Contract execution', senderAddress: 'Partnership Execution', receiverAddress: '3Pasdfawe56f5wae4f68', amount: 1.00},
      {month: 'Feb', day: '22', eventType: 'Contract execution', senderAddress: 'Partnership Execution', receiverAddress: '3Pasdfawe56f5wae4f68', amount: 1.00}
    ];
    this.walletBalance = this.myBalance;
    this.includedDataLength = 0;
  }


  userData() {
      return this.authServ.showKeystore().then( (resultA) => {
          return Promise.all([resultA, this.txnServ.checkBalance(resultA.address)]); // resultA will implicitly be wrapped
      }).then( ([resultA, resultB]) => {
        this.senderAddress = "0x" + resultA.address ;
        this.walletBalance = resultB;
      });
  }


  public getMaxTransactionFee() {
    // TODO: calculation logic here
    return 0.000420;
  }

  public setSendEverything(event) {
    if(event) {
      this.amount = this.walletBalance;
    }
    this.sendEverything = event;
  }

  public getTotalAmount() {
    if(this.amount) {
      return Number(this.amount) + Number(this.getMaxTransactionFee());
    }
    else {
      return 0;
    }
  }

  // showKeyStore() {
  //   this.authServ.showKeystore().then( v => {
  //     this.backupKeystore =	v
  //   })
  // }


 

  // unlockAccount(password) {
  //   // set up as a promise to let user know about wrong password
  //   this.authServ.unencryptKeystore( password ).then( (v) => {
  //     this.decryptKeystore = v
  //   }, (err) => {
  //     this.decryptKeystore = err
  //   })
  // }



  // mark for removal
  // showDecryptedKeyStore() {
  //   // set up as a promise to let user know about wrong password
  //   this.authServ.unencryptKeystore( "prettyGoodPa55w0rd").then( (v) => {
  //     this.decryptKeystore = v
  //   }, (err) => {
  //     this.decryptKeystore = err
  //   })
  // }



  // checkYourBalance() {
  //   if(this.decryptKeystore) {
  //       this.txnServ.checkBalance(this.decryptKeystore.address).then( res => {
  //         console.log("res " +  res)
  //         this.myBalance = 	res
  //       }, (err) => {
  //         this.myBalance = err
  //       })
  //   } else {
  //     alert("Error: Either your keystore does not exist or you have not unlocked it, is your password correct ?")
  //   }
  // }

  // checkReceiverBalance( address ) {
  //  // this.theirBalance = this.txnServ.checkBalance()
  //  this.txnServ.checkBalance( address ).then( res => {
  //   console.log("res " +  res)
  //   this.theirBalance = 	res
  // } )
  // }


  // createTransaction(){
  // if(  this.decryptKeystore ) {
  //     this.txnServ.transaction(  this.decryptKeystore.privateKey, this.decryptKeystore.address, "0xb0573f6b040fddf1250cdd38983f4eac06fbf3ca", '0.01', "hi its paddy" )
  // } else {
  //   alert("Error: Either your keystore does not exist or you have not unlocked it, is your password correct ?")
  // }
  // }


  public showMore() {}

  public showTransactions() {}

  public getICoin(amount) {
    return amount > 0;
  }


  public send() {
    this.modalSrv.openTransactionConfirm().then( 
      (result)=>{ 
        if( this.privateKey ){
          console.log("this.privateKey use has made a recent transaction, add feature to remove pw confirm"+ this.privateKey)
        }
        this.privateKey = result.privateKey; 
        this.txnServ.transaction(  this.privateKey, result.address, this.receiverAddress, this.amount, "aerum test transaction" )
    }, ()=>{
       console.log("catch");
    });

  }




}