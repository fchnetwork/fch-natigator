import { CommonModule } from "@angular/common";
import { NgModule, ModuleWithProviders } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { TranslateModule } from "@ngx-translate/core";
import { TranslateLoader } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { CreateTransactionComponent } from "./create-transaction/create-transaction.component";
import { LastTransactionsComponent } from "@app/wallet/transaction/components/last-transactions/last-transactions.component";
import { AppUIModule } from "@app/app.ui.module";
import { SharedModule } from "@app/shared/shared.module";
import { TransactionMoreOptionsComponent } from "@app/wallet/transaction/components/transaction-more-options/transaction-more-options.component";
import { TransactionRoutingModule } from "@app/wallet/transaction/transaction.routes";
import { CoreModule } from "@app/core/core.module";
import { TransactionSignModalComponent } from "@app/wallet/transaction/components/transaction-sign-modal/transaction-sign-modal.component";
import { TransactionModalComponent } from "@app/wallet/explorer/components/transaction-modal/transaction-modal.component";
import { ExplorerModule } from "@app/wallet/explorer/explorer.module";
import { ReceiveReadMoreComponent } from '@app/wallet/transaction/receive-read-more/receive-read-more.component';

@NgModule({
  entryComponents: [
    ReceiveReadMoreComponent,
    TransactionSignModalComponent,
    CreateTransactionComponent,
    LastTransactionsComponent
  ],
  imports: [
    FormsModule,
    AppUIModule,
    CommonModule,
    ReactiveFormsModule,
    TransactionRoutingModule,
    SharedModule,
    CoreModule,
    ExplorerModule
  ],
  declarations: [
    CreateTransactionComponent,
    LastTransactionsComponent,
    TransactionSignModalComponent,
    TransactionMoreOptionsComponent,
    ReceiveReadMoreComponent
  ],
  exports: [
    LastTransactionsComponent,
    ReceiveReadMoreComponent
  ]
})
export class TransactionModule {}
