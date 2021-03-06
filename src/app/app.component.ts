import { PendingTransactionsService } from './core/transactions/pending-transactions/pending-transactions.service';
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LoggerService } from "@app/core/general/logger-service/logger.service";
import { ConnectionCheckerService } from "@core/general/connection-checker-service/connection-checker.service";
import { TranslateService } from "@ngx-translate/core";
import { SettingsService } from '@core/settings/settings.service';
import { GlobalEventService } from "@core/general/global-event-service/global-event.service";
import { UniversalLinkService } from "@mobile/universal-link/universal-link.service";
import { EnvironmentService } from "@core/general/environment-service/environment.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  title = "app";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private logger: LoggerService,
    private globalEventService: GlobalEventService,
    public connectionCheckerService: ConnectionCheckerService,
    public translate: TranslateService,
    public settingsService: SettingsService,
    public pendingTxns: PendingTransactionsService,
    public universalLinkService: UniversalLinkService,
    private environment: EnvironmentService
  ) {
    // Initialize global events
    this.globalEventService.init();

    // Initialize the logger service
    logger.setLogLevel(environment.get().loglevel);

    // Configure the translation service.
    this.translate.use(this.settingsService.settings.generalSettings.language);

    // Initialize universal links
    this.universalLinkService.init();
  }

  ngOnInit() {
    this.logger.logMessage(`Current Env: ${this.environment.get().configInUse}`);
    this.logger.logMessage(
      `Current WebsocketProvider: ${this.environment.get().WebsocketProvider}`
    );
  }
}
