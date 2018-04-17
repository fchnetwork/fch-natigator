import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Overlay } from 'ngx-modialog';
import { Observable } from 'rxjs/Observable';
import { AuthenticationService } from '@account/services/authentication-service/authentication.service'

const Tx = require('ethereumjs-tx');
const ethJsUtil = require('ethereumjs-util');
const Web3 = require('web3');

declare var window: any;
declare var window: any;

@Injectable()
export class TransactionServiceService {

    web3: any;
    
    constructor( _auth: AuthenticationService ) {
      this.web3 = _auth.initWeb3();
    }





    checkBalance(account?:string) {
      return this.web3.eth.getBalance(account);
    }  
      

    transaction( privkey, activeUser, to, amount, data ) : Promise<any> {
        return new Promise( (resolve, reject) => {
            const privateKey =  ethJsUtil.toBuffer( privkey );
            const sendTo = ethJsUtil.toChecksumAddress( to ) ;
            const from = ethJsUtil.toChecksumAddress( activeUser );
            const txValue = this.web3.utils.numberToHex(this.web3.utils.toWei( amount.toString(), 'ether'));
            const txData = this.web3.utils.asciiToHex( data ); 
            const getGasPrice = this.web3.eth.getGasPrice();
            const getTransactionCount = this.web3.eth.getTransactionCount( from );
            const estimateGas = this.web3.eth.estimateGas({to:sendTo, data:txData});            

         return Promise.all([getGasPrice, getTransactionCount, estimateGas]).then( (values) => {
              const nonce = parseInt(values[1], 10);   
              const gas = parseInt(values[2], 10);   
              const rawTransaction = {
                nonce: this.web3.utils.toHex( nonce ), 
                gas: this.web3.utils.toHex( gas ),
                gasPrice: this.web3.utils.toHex( this.web3.utils.toWei( "3", 'gwei')),
                to,
                value: txValue,
                // data: txData
              };
              const tx = new Tx(rawTransaction);
                    tx.sign(privateKey);       
                  const transaction = this.web3.eth.sendSignedTransaction( ethJsUtil.addHexPrefix( tx.serialize().toString('hex') ) );
                      transaction.on('transactionHash', hash => { 
                        alert(hash); 
                        setTimeout(() => {
                          this.web3.eth.getTransactionReceipt( hash ).then( res =>  alert( "receipt "+JSON.stringify(res) ) );
                        }, 4000);
                      }).catch( error => {
                          alert( error );
                      });
            });
        });
    }
}