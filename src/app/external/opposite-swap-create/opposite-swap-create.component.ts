import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";

import { EnvironmentService } from "@core/general/environment-service/environment.service";
import { TranslateService } from '@ngx-translate/core';
import { toBigNumberString } from "@shared/helpers/number-utils";
import { genTransactionExplorerUrl } from "@shared/helpers/url-utils";
import { sha3 } from 'web3-utils';
import { Guid } from "@shared/helpers/guid";
import { TokenError } from "@core/transactions/token-service/token.error";
import { Chain } from "@core/swap/cross-chain/swap-template-service/chain.enum";
import { SwapTemplate } from "@core/swap/cross-chain/swap-template-service/swap-template.model";
import { LoggerService } from "@core/general/logger-service/logger.service";
import { InternalNotificationService } from "@core/general/internal-notification-service/internal-notification.service";
import { AerumNameService } from "@core/aens/aerum-name-service/aerum-name.service";
import { EthereumAuthenticationService } from "@core/ethereum/ethereum-authentication-service/ethereum-authentication.service";
import { TokenService } from "@core/transactions/token-service/token.service";
import { Token } from "@core/transactions/token-service/token.model";
import { SwapReference } from "@core/swap/cross-chain/swap-local-storage/swap-reference.model";
import { SwapType } from "@core/swap/models/swap-type.enum";
import { SwapTemplateService } from "@core/swap/cross-chain/swap-template-service/swap-template.service";
import { OpenAerumErc20SwapService } from "@core/swap/cross-chain/open-aerum-erc20-swap-service/open-aerum-erc20-swap.service";
import { EthWalletType } from "@external/models/eth-wallet-type.enum";
import { ClipboardService } from "@core/general/clipboard-service/clipboard.service";
import { EthereumTokenService } from "@core/ethereum/ethereum-token-service/ethereum-token.service";
import { SwapLocalStorageService } from "@core/swap/cross-chain/swap-local-storage/swap-local-storage.service";
import { InjectedWeb3Error } from "@external/models/injected-web3.error";
import { AuthenticationService } from '@app/core/authentication/authentication-service/authentication.service';
import { TransactionService } from '@app/core/transactions/transaction-service/transaction.service';

@Component({
  selector: 'app-opposite-swap-create',
  templateUrl: './opposite-swap-create.component.html',
  styleUrls: ['./opposite-swap-create.component.scss']
})
export class OppositeSwapCreateComponent implements OnInit, OnDestroy {
  private routeSubscription: Subscription;
  private params: { asset?: string, amount?: number, wallet?: EthWalletType, account?: string, query?: string, token?: string, symbol?: string } = {};
  private ethAddress = '0x0';
  private ethSymbol = 'ETH';

  secret: string;
  amount: number;
  aerAmount: number;

  tokens = [];
  selectedToken: Token;

  templates: SwapTemplate[] = [];
  selectedTemplate: SwapTemplate;

  rate: number;
  tokenAmount: number;
  walletToken: Token;
  walletTokenSymbol: string;

  openSwapTransactionExplorerUrl: string;
  approveTokenTransactionExplorerUrl: string;

  processing = false;
  canCreateSwap = false;
  swapCreated = false;

  importTokenInProgress = false;

  constructor(private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private logger: LoggerService,
    private clipboardService: ClipboardService,
    private notificationService: InternalNotificationService,
    private nameService: AerumNameService,
    private ethereumAuthService: EthereumAuthenticationService,
    private tokenService: TokenService,
    private swapTemplateService: SwapTemplateService,
    private erc20SwapService: OpenAerumErc20SwapService,
    private ethereumTokenService: EthereumTokenService,
    private swapLocalStorageService: SwapLocalStorageService,
    private authService: AuthenticationService,
    private transactionService: TransactionService,
    private translateService: TranslateService,
    private environment: EnvironmentService) { }

  async ngOnInit() {
    this.routeSubscription = this.route.queryParams.subscribe(param => this.init(param));
    this.secret = Guid.newGuid().replace(/-/g, '');

    const keystore = await this.authService.showKeystore();
    this.aerAmount = await this.transactionService.checkBalance(keystore.address);
  }

  async init(param) {
    try {
      await this.tryInit(param);
    } catch (e) {
      if(e instanceof TokenError) {
        this.logger.logError('Cannot load token information', e);
        this.notificationService.showMessage(this.translateService.instant('EXTERNAL-SWAP.CREATE-OPPOSITE.PLEASE_CONFIGURE_THE_TOKEN_FIRST'), this.translateService.instant('ERROR'));
      } else {
        this.logger.logError('Withdrawal swap data load error', e);
        this.notificationService.showMessage(this.translateService.instant('EXTERNAL-SWAP.CREATE-OPPOSITE.CANNOT_LOAD_WITHDRAWAL_SWAP_SCREEN'), this.translateService.instant('ERROR'));
      }
    }
  }

  async tryInit(param) {
    if (!param.account) {
      this.logger.logError('Ethereum account is required but not provided');
      throw new Error('Ethereum account is required but not provided');
    }

    this.params = {
      asset: await this.nameService.safeResolveNameOrAddress(param.asset),
      amount: Number(param.amount) || 0,
      wallet: param.wallet ? Number(param.wallet) : EthWalletType.Injected,
      account: param.account,
      query: param.query,
      token: param.token ? param.token : this.ethAddress,
      symbol: param.symbol ? param.symbol : this.ethSymbol
    };

    this.amount = this.params.amount;
    this.tokens = this.tokenService.getTokens() || [];
    this.walletTokenSymbol = this.params.symbol;
    await this.ensureTokenPresent(this.params.asset);
    await this.loadSwapTemplates();
    await this.loadWalletToken();
  }

  onTokenChange() {
    if (this.selectedToken) {
      this.importTokenInProgress = false;
      this.loadSwapTemplates();
    } else {
      this.importTokenInProgress = true;
      this.selectedToken = null;
    }
  }

  async onTokenAdded(token: Token) {
    this.importTokenInProgress = false;
    this.selectedToken = token;
    this.tokens = this.tokenService.getTokens() || [];
    this.loadSwapTemplates();
  }

  onTemplateChange() {
    return this.recalculateTotals();
  }

  onAmountChange(amount: string) {
    this.amount = Number(amount) || 0;

    return this.recalculateTotals();
  }

  private async ensureTokenPresent(address: string): Promise<void> {
    if (!address) {
      this.logger.logMessage("Token to check not specified");
      return;
    }

    const isPresent = this.tokens.some(token => token.address.toLowerCase() === address.toLowerCase());
    if (!isPresent) {
      await this.loadTokenAndAddToList(address);
    } else {
      this.selectDefaultToken();
    }
  }

  private loadTokenAndAddToList(address: string): Promise<void> {
    return this.tokenService.getTokensInfo(address).then(token => {
      this.tokens.unshift(token);
      this.selectDefaultToken();
    });
  }

  private selectDefaultToken() {
    if (this.tokens.length) {
      const assetToken = this.tokens.find(token => token.address.toLowerCase() === this.params.asset.toLowerCase());
      if (assetToken) {
        this.selectedToken = assetToken;
      } else {
        this.selectedToken = this.tokens[0];
      }
    }
  }

  private async loadSwapTemplates(): Promise<void> {
    if (!this.selectedToken) {
      this.logger.logMessage("Token not selected");
      return;
    }
    const templates = await this.swapTemplateService.getTemplatesByOffchainAsset(this.selectedToken.address, this.params.token, Chain.Ethereum);
    if (templates) {
      this.templates = templates.sort((one, two) => Number(one.rate <= two.rate));
      this.selectedTemplate = this.templates[0];
    } else {
      this.templates = [];
      this.selectedTemplate = null;
    }
    await this.recalculateTotals();
  }

  private async loadWalletToken() {
    if(this.params.token !== this.ethAddress){
      this.walletToken = await this.ethereumTokenService.getNetworkTokenInfo(this.params.wallet, this.params.token, this.params.account);
    }
  }

  private async recalculateTotals() {
    if (this.selectedTemplate) {
      this.rate = this.selectedTemplate.rate;
      this.tokenAmount = this.amount * this.selectedTemplate.rate;
      if (this.selectedToken) {
        this.canCreateSwap = this.selectedToken.balance >= this.amount;
      } else {
        this.canCreateSwap = false;
      }
    } else {
      this.rate = 0;
      this.tokenAmount = 0;
      this.canCreateSwap = false;
    }
  }

  async copyToClipboard() {
    if (this.secret) {
      await this.clipboardService.copy(this.secret);
      this.notificationService.showMessage(this.translateService.instant('COPIED_TO_CLIPBOARD'), this.translateService.instant('DONE'));
    }
  }

  canMoveNext(): boolean {
    return this.canCreateSwap && !this.swapCreated && !this.processing && (this.amount > 0) && (this.aerAmount > 0);
  }

  async next() {
    try {
      this.processing = true;
      this.notificationService.showMessage(this.translateService.instant('EXTERNAL-SWAP.CREATE-OPPOSITE.CREATING_WITHDRAWAL_SWAP'), this.translateService.instant('IN_PROGRESS'));
      await this.openERC20Swap();
      this.notificationService.showMessage(this.translateService.instant('EXTERNAL-SWAP.CREATE-OPPOSITE.WITHDRAWAL_SWAP_CREATED'), this.translateService.instant('SUCCESS'));
    }
    catch (e) {
      // NOTE: We show more detailed errors for injected web3 in called functions
      if(!(e instanceof InjectedWeb3Error)) {
        this.logger.logError('Error while creating withdrawal swap', e);
        this.notificationService.showMessage(this.translateService.instant('EXTERNAL-SWAP.CREATE-OPPOSITE.ERROR_WHILE_CREATING_WITHDRAWAL_SWAP'), this.translateService.instant('ERROR'));
      }
    } finally {
      this.processing = false;
    }
  }

  async openERC20Swap() {
    await this.loadEthAccount();
    this.approveTokenTransactionExplorerUrl = null;
    this.openSwapTransactionExplorerUrl = null;

    const hash = sha3(this.secret);
    const amount = toBigNumberString(this.amount * Math.pow(10, Number(this.selectedToken.decimals)));
    const timestamp = this.calculateTimestamp(this.environment.get().contracts.swap.crossChain.swapExpireTimeoutInSeconds);
    const counterpartyTrader = await this.nameService.safeResolveNameOrAddress(this.selectedTemplate.offchainAccount);

    this.logger.logMessage(`Secret: ${this.secret}, hash: ${hash}, timestamp: ${timestamp}, trader: ${counterpartyTrader}. amount: ${amount}`);
    await this.erc20SwapService.openSwap(
      hash,
      this.selectedToken.address,
      amount,
      counterpartyTrader,
      timestamp,
      (txHash) => this.onApproveTokenHashReceived(txHash),
      (txHash) => this.onOpenSwapHashReceived(txHash, hash)
    );

    return this.router.navigate(['external/confirm-opposite-swap'], {queryParams: {hash, query: this.params.query, token: this.params.token, symbol: this.params.symbol}});
  }

  private async loadEthAccount() {
    if (this.params.wallet === EthWalletType.Injected) {
      await this.loadInjectedEthAccount();
    } else {
      this.loadImportedEthAccount();
    }
  }

  private async loadInjectedEthAccount() {
    try {
      await this.ethereumAuthService.ensureEthereumEnabled();
    } catch (error) {
      this.notificationService.showMessage(this.translateService.instant('BASE_CONTRACT.CANNOT_LOAD_ACCOUNT'), this.translateService.instant('ERROR'));
      throw new InjectedWeb3Error(this.translateService.instant('BASE_CONTRACT.CANNOT_LOAD_ACCOUNT'));
    }
    const injectedWeb3 = await this.ethereumAuthService.getInjectedWeb3();
    if (!injectedWeb3) {
      this.notificationService.showMessage(this.translateService.instant('EXTERNAL-SWAP.CREATE-OPPOSITE.INJECTED_WEB3_NOT_PROVIDED'), this.translateService.instant('ERROR'));
      throw new InjectedWeb3Error(this.translateService.instant('EXTERNAL-SWAP.CREATE-OPPOSITE.INJECTED_WEB3_NOT_PROVIDED'));
    }

    const account = this.params.account;
    const accounts = await injectedWeb3.eth.getAccounts() || [];
    if (!accounts.length) {
      this.notificationService.showMessage(this.translateService.instant('EXTERNAL-SWAP.CREATE-OPPOSITE.PLEASE_LOGIN_IN_MIST__METAMASK'), this.translateService.instant('ERROR'));
      throw new InjectedWeb3Error(this.translateService.instant('EXTERNAL-SWAP.CREATE-OPPOSITE.CANNOT_GET_ACCOUNTS_FROM_SELECTED_PROVIDER'));
    }

    if (accounts.every(acc => acc !== account)) {
      this.notificationService.showMessage(`${this.translateService.instant('EXTERNAL-SWAP.CREATE-OPPOSITE.PLEASE_SELECT')} ${account} ${this.translateService.instant('EXTERNAL-SWAP.CREATE-OPPOSITE.AND_RETRY')}`, this.translateService.instant('ERROR'));
      throw new InjectedWeb3Error(`${this.translateService.instant('EXTERNAL-SWAP.CREATE-OPPOSITE.INCORRECT_MIST__METAMASK_ACCOUNT_SELECTED__EXPECTED')} ${account}`);
    }
  }

  private loadImportedEthAccount() {
    const importedAccount = this.ethereumAuthService.getEthereumAccount(this.params.account);
    if (!importedAccount) {
      this.notificationService.showMessage(`${this.translateService.instant('EXTERNAL-SWAP.CREATE-OPPOSITE.CANNOT_LOAD_IMPORTED_ACCOUNT')} ${this.params.account}`, this.translateService.instant('ERROR'));
      throw Error(`Cannot load imported account ${this.params.account}`);
    }
  }

  private calculateTimestamp(timeoutInSeconds: number) {
    return Math.ceil((new Date().getTime() / 1000) + timeoutInSeconds);
  }

  private onApproveTokenHashReceived(txhash: string): void {
    this.notificationService.showMessage(`${this.translateService.instant('EXTERNAL-SWAP.CREATE-OPPOSITE.APPROVING')} ${this.selectedToken.symbol} ${this.translateService.instant('EXTERNAL-SWAP.CREATE-OPPOSITE.TOKEN_ALLOWANCE')}`, this.translateService.instant('IN_PROGRESS'));
    this.approveTokenTransactionExplorerUrl = genTransactionExplorerUrl(txhash, Chain.FCH);
  }

  private onOpenSwapHashReceived(txHash: string, hash: string): void {
    this.notificationService.showMessage(this.translateService.instant('EXTERNAL-SWAP.CREATE-OPPOSITE.OPENING_WITHDRAWAL_SWAP'), this.translateService.instant('IN_PROGRESS'));
    this.openSwapTransactionExplorerUrl = genTransactionExplorerUrl(txHash, Chain.FCH);

    const localSwap: SwapReference = {
      hash,
      secret: this.secret,
      opened: Date.now(),
      account: this.authService.getAddress(),
      walletType: this.params.wallet,
      walletTokenAddress: this.params.token,
      walletTokenSymbol: this.params.symbol,
      token: this.selectedToken.address,
      tokenAmount: this.amount,
      swapType: SwapType.Withdrawal,
    };
    if(this.walletTokenSymbol === this.ethSymbol){
      localSwap.ethAmount = this.tokenAmount;
    }else{
      localSwap.erc20Amount = this.tokenAmount;
    }
    this.swapLocalStorageService.storeSwapReference(localSwap);
    this.swapCreated = true;
    this.logger.logMessage(`Withdrawal swap ${hash} created`);
  }

  explorerLink(link) {
    window.open(
      link,
      '_blank'
    );
  }

  cancel() {
    if(this.swapCreated && this.params.query) {
      return this.router.navigate(['external/transaction'], {queryParams: {query: this.params.query}});
    }
    this.location.back();
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
}
