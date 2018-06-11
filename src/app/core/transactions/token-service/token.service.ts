import * as CryptoJS from 'crypto-js';
import { environment } from '@app/../environments/environment';
import { Injectable } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { SessionStorageService } from 'ngx-webstorage';
import Web3 from 'web3';
import { tokensABI } from '@app/core/abi/tokens';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { iToken } from '@shared/app.interfaces';
import { AuthenticationService } from '@app/core/authentication/authentication-service/authentication.service';
import { Token } from "@core/transactions/token-service/token.model";
import { LoggerService } from "@core/general/logger-service/logger.service";
import { TokenError } from "@core/transactions/token-service/token.error";

@Injectable()
export class TokenService {
  web3: Web3;
  tokensContract: any;
  tokens$: BehaviorSubject<iToken>= new BehaviorSubject(<any>[]);

  constructor(
    private logger: LoggerService,
    private _auth: AuthenticationService,
    private sessionStorage: SessionStorageService,
  ) {
    this.web3 = _auth.initWeb3();
  }

  addToken(tokenData) {
    const token = tokenData;
    const tokens = this.sessionStorage.retrieve('tokens') || [];
    tokens.push(token);
    this.saveTokens(tokens);
    // ADD observable here
    this.tokens$.next(tokens);
    setTimeout(()=>{
      this.updateTokensBalance();
    }, 100);
  }

  deleteToken(token) {
    let tokens = this.sessionStorage.retrieve('tokens') || [];
    tokens = tokens.filter((item)=>{
      return item.address !== token.address;
    });
    this.saveTokens(tokens);
    // ADD observable here
    this.tokens$.next(tokens);
    setTimeout(()=>{
      this.updateTokensBalance();
    }, 100);
  }

  saveTokens(tokens) {
    const password = this.sessionStorage.retrieve('password');
    const stringtoken = JSON.stringify(tokens);
    const encryptedtokens = CryptoJS.AES.encrypt( stringtoken, password );
    Cookie.set('tokens', encryptedtokens, 7, "/", environment.cookiesDomain);
    this.sessionStorage.store('tokens', tokens);
  }

  getTokens() {
   return this.sessionStorage.retrieve('tokens');
  }

  getLocalToken(address: string): Token {
    if(!address){
      return null;
    }

    const tokens = this.getTokens();
    const token = tokens.find(item => item.address.toLowerCase() === address.toLowerCase());
    return token;
  }

  updateStoredTokens(token) {
    const tokens = this.sessionStorage.retrieve('tokens');
    const updatedTokens = tokens.filter((item)=>{
      return item.symbol !== token.symbol;
    });
    updatedTokens.push(token);
    this.saveTokens(updatedTokens);
  }

  updateTokensBalance() {
    const tokens = this.sessionStorage.retrieve('tokens');
    const address = this.sessionStorage.retrieve('acc_address');
    return new Promise((resolve)=> {
      for (let i = 0; i < tokens.length; i++) {
        this.tokensContract = new this.web3.eth.Contract(tokensABI, tokens[i].address);
        this.tokensContract.methods.balanceOf(address).call({}).then((res)=>{
          tokens[i].balance = res / Math.pow(10, tokens[i].decimals);
          this.updateStoredTokens(tokens[i]);
          if(i === Number(tokens.length - 1)) {
            const tokens = this.sessionStorage.retrieve('tokens');
            resolve(tokens);
          }
        });
      }
    });
  }

  getTokensInfo(contractAddress): any {
    return new Promise((resolve, reject) => {
      const address = this.web3.utils.isAddress(contractAddress);
      const myAddress = this.sessionStorage.retrieve('acc_address');
      if(address) {
        this.tokensContract = new this.web3.eth.Contract(tokensABI, contractAddress);
        this.tokensContract.methods.symbol().call({}, (error, result)=>{
          const contract = {
            symbol: '',
            decimals: 0,
            totalSupply: 0,
            balance: 0,
          };
          contract.symbol = result;
          this.tokensContract.methods.decimals().call({}, (error, result)=>{
            contract.decimals = result;
            this.tokensContract.methods.totalSupply().call({}, (error, result)=>{
              contract.totalSupply = result;
              this.tokensContract.methods.balanceOf(myAddress).call({}).then((res)=>{
                contract.balance = res / res / Math.pow(10, contract.decimals);
                resolve(contract);
              });
            });

          });
        });
      } else {
        reject('not valid address');
      }
    });
  }

  async getLocalOrNetworkTokenInfo(address: string): Promise<Token> {
    let token = this.getLocalToken(address);
    if(token && token.symbol) {
      return token;
    }

    token = await this.getNetworkTokenInfo(address);
    if(!token || !token.symbol){
      throw new TokenError(`Error while loading ${address} token info`);
    }

    return token;
  }

  private getNetworkTokenInfo(address: string): Promise<Token> {
    try {
      return this.getTokensInfo(address);
    } catch (e) {
      this.logger.logError(`Error while loading ${address} token info`, e);
      throw new TokenError(`Error while loading ${address} token info`);
    }
  }

  tokenFallbackCheck(receiver, signature) {
    return new Promise((resolve, reject)=>{
      this.web3.eth.getCode(receiver).then((res)=>{
        let hash = this.web3.utils.keccak256(signature);
        hash = "63" + hash.slice(2,10);
        resolve(res.includes(hash));
      });
    });

  }

  getTokenTransactionValue(contractAddress, blockNumber) {
    return new Promise((resolve, reject) => {
      const tokensContract = new this.web3.eth.Contract(tokensABI, contractAddress);
      tokensContract.events.Transfer({ fromBlock: blockNumber}, (contractEventsErr, eventsRes) => {
        if (contractEventsErr) {
          reject(contractEventsErr);
        } else {
          if (eventsRes.blockNumber === blockNumber) {
            resolve(eventsRes.returnValues._value);
          }
        }
      });
    });
  }
}
