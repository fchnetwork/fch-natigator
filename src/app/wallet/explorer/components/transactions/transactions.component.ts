import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ModalService } from '@core/general/modal-service/modal.service';
import { ExplorerService } from '@core/explorer/explorer-service/explorer.service';
import { LoaderService } from '@core/general/loader-service/loader.service';
import { TransactionModalData } from '@app/wallet/explorer/components/transaction-modal/transaction-modal.component';
import { BlockModalData } from '@app/wallet/explorer/components/block-modal/block-modal.component';
import { iTransaction } from '@app/shared/app.interfaces';
import { EnvironmentService } from "@core/general/environment-service/environment.service";

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})

export class TransactionsComponent implements AfterViewInit {
  transactionsFound: number;
  transactions: iTransaction[] = [];
  column: string = 'timestamp';
  descending: boolean = false;
  transactionStatus: boolean = false;
  latestBlock: number;
  highBlock: number;
  lowBlock: number;
  maxBlocks: number = 100;
  perfectScrollbarDisabled: boolean;

  constructor(public exploreSrv: ExplorerService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService,
    private loaderService: LoaderService,
    private environment: EnvironmentService,) {
    this.perfectScrollbarDisabled = this.environment.get().isMobileBuild;
  }

  ngAfterViewInit() {
    // First get the latest block number
    this.exploreSrv.getLatestBlockNumber().then(latestBlockNumber => {
      this.highBlock = latestBlockNumber;
      this.latestBlock = latestBlockNumber;
      this.loadTransactions();
    });
  }

  loadTransactions() {
    this.loaderService.toggle(true);

    this.exploreSrv.getTransactions(this.highBlock, this.maxBlocks).then(transactionList => {
      this.loaderService.toggle(false);
      this.transactions = this.transactions.concat(transactionList.transactions);
      this.highBlock = transactionList.highBlock - 1;
    });
  }

  async openBlock(transaction) {
    const data: BlockModalData = {
      block: transaction.block,
      blockNumber: transaction.blockNumber
    };

    await this.modalService.openBlock(data);
  }

  async openTransaction(transaction) {
    const data: TransactionModalData = {
      hash: transaction.hash,
      transaction: transaction,
      external: false,
      orderId: null,
      urls: null
    };

    this.modalService.openTransaction(data);
  }
}
