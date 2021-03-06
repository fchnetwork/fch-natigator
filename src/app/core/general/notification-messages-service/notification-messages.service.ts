import { Injectable } from "@angular/core";
import { NotificationService } from "@aerum/ui";
import { TranslateService } from "@ngx-translate/core";
import 'rxjs/add/operator/first';

@Injectable()
export class NotificationMessagesService {
  constructor(
    private notificationService: NotificationService,
    private translateService: TranslateService
  ) {}

  protected translate(key: string): string {
    return this.translateService.instant(key);
  }

  protected translateAsync(key: string): Promise<string> {
    return new Promise(resolve => {
      this.translateService.get(key)
        .first()
        .subscribe(r => {
          resolve(r);
        });
    });
  }

  /**
   *Shows notification when transaction status has changed to SUCCESSFULL
   *
   * @param {*} hash Transaction hash
   * @memberof NotificationMessagesService
   */
  public succefullSentNotification(hash) {
    this.notificationService.notify(
      `${this.translate(
        "SEND_RECEIVE.NOTIFICATION_TITLE_TRANSACTION_STATUS"
      )}: ${this.translate("SEND_RECEIVE.STATUSES.SUCCESFULLY_SENT")}`,
      `${this.translate("SEND_RECEIVE.TRANSACTION")} ${hash} ${this.translate(
        "SEND_RECEIVE.IS"
      )} ${this.translate("SEND_RECEIVE.STATUSES.SUCCESFULLY_SENT")}`,
      "transaction",
      10000
    );
  }

  public importWalletProcessing(walletAddress: string, ammount: number) {
    this.notificationService.notify(
      `${this.translate("SHARED.IMPORT_WALLET.IMPORTING_NOTIFICATION_TITLE")}`,
      `${this.translate(
        "SHARED.IMPORT_WALLET.IMPORTING_NOTIFICATION_ADDRESS"
      )}: ${walletAddress} \n\r ${this.translate(
        "SHARED.IMPORT_WALLET.IMPORTING_NOTIFICATION_AMOUNT"
      )}: ${ammount} GAS`,
      "transaction",
      5000
    );
  }

  public importWalletSuccessfulll() {
    this.notificationService.notify(
      `${this.translate("SHARED.IMPORT_WALLET.IMPORTING_NOTIFICATION_TITLE")}`,
      `${this.translate(
        "SHARED.IMPORT_WALLET.IMPORTING_NOTIFICATION_SUCCESS"
      )}`,
      "transaction",
      5000
    );
  }

  /**
   *Shows notification when transaction has failed
   *
   * @memberof NotificationMessagesService
   */
  public failedTransactionNotification() {
    this.notificationService.notify(
      `${this.translate(
        "SEND_RECEIVE.NOTIFICATION_TITLE_TRANSACTION_STATUS"
      )}: ${this.translate("SEND_RECEIVE.STATUSES.FAILED")}`,
      this.translate("SEND_RECEIVE.STATUSES.FAILED"),
      "aerumleaf",
      10000
    );
  }

  /**
   *Shows notification when transaction status has changed to PENDING
   *
   * @param {*} hash Transaction hash
   * @memberof NotificationMessagesService
   */
  public pendingTransactionNotification(hash) {
    this.notificationService.notify(
      `${this.translate(
        "SEND_RECEIVE.NOTIFICATION_TITLE_TRANSACTION_STATUS"
      )}: ${this.translate("SEND_RECEIVE.STATUSES.PENDING")}`,
      `${this.translate("SEND_RECEIVE.TRANSACTION")} ${hash} ${this.translate(
        "SEND_RECEIVE.IS"
      )} ${this.translate("SEND_RECEIVE.STATUSES.PENDING")}`,
      "pending",
      10000
    );
  }

  /**
   *Shows notification when transaction has been mined
   *
   * @param {*} hash Transaction hash
   * @memberof NotificationMessagesService
   */
  public transactionMinedNotification(hash) {
    this.notificationService.notify(
      `${this.translate(
        "SEND_RECEIVE.NOTIFICATION_TITLE_TRANSACTION_STATUS"
      )}: ${this.translate("SEND_RECEIVE.STATUSES.MINED")}`,
      `${this.translate("SEND_RECEIVE.TRANSACTION")} ${hash} ${this.translate(
        "SEND_RECEIVE.HAS_BEEN"
      )} ${this.translate("SEND_RECEIVE.STATUSES.MINED")}`,
      "pending",
      10000
    );
  }

  /**
   *Shows notification when Aerum DISCONNECTED from network
   *
   * @memberof NotificationMessagesService
   */
  public connectionDisconnected() {
    this.notificationService.notify(
      `${this.translate("CONNECTION.CONNECTION_STATUS")}: ${this.translate(
        "CONNECTION.STATUS_TITLE.DISCONNECTED"
      )}`,
      this.translate("CONNECTION.STATUS_BODY.DISCONNECTED"),
      "blocks",
      10000
    );
  }

  /**
   *Shows notification when Aerum CONNECTED to network
   *
   * @memberof NotificationMessagesService
   */
  public async connectionConnected() {
    this.notificationService.notify(
      `${await this.translateAsync("CONNECTION.CONNECTION_STATUS")}: ${await this.translateAsync(
        "CONNECTION.STATUS_TITLE.CONNECTED"
      )}`,
      await this.translateAsync("CONNECTION.STATUS_BODY.CONNECTED"),
      "blocks",
      10000
    );
  }

  /**
   *Show notification when language has been changed
   *
   * @param {*} language
   * @memberof NotificationMessagesService
   */
  public langugeChanged(language) {
    this.notificationService.notify(
      `${this.translate(
        "SETTINGS.GENERAL.NOTIFICATIONS.CHANGE_LANGUAGE.TITLE"
      )}`,
      `${this.translate(
        "SETTINGS.GENERAL.NOTIFICATIONS.CHANGE_LANGUAGE.BODY"
      )} ${language}`,
      "translation",
      10000
    );
  }

  /**
   *Shows notification if token is not in the cookies
   *
   * @memberof NotificationMessagesService
   */
  public tokenNotInTheCookies() {
    this.notificationService.notify(
      `${this.translate(
        "EXTERNAL_TRANSACTION.NOTIFICATION_TITLE_TOKEN_NOT_IN_WALLET"
      )}`,
      `${this.translate(
        "EXTERNAL_TRANSACTION.NOTIFICATION_BODY_TOKEN_NOT_IN_WALLET"
      )}`,
      "info",
      10000
    );
  }

  /**
   *Shows notification if token is not configured
   *
   * @memberof NotificationMessagesService
   */
  public tokenNotConfigured() {
    this.notificationService.notify(
      `${this.translate(
        "EXTERNAL_TRANSACTION.NOTIFICATION_TITLE_TOKEN_NOT_CONFIGURED"
      )}`,
      `${this.translate(
        "EXTERNAL_TRANSACTION.NOTIFICATION_BODY_TOKEN_NOT_CONFIGURED"
      )}`,
      "exclamation-triangle",
      10000
    );
  }

  /**
   *Shows notification when settings has been saved
   *
   * @memberof NotificationMessagesService
   */
  public saveSettings() {
    this.notificationService.notify(
      `${this.translate("SETTINGS.COMMON.NOTIFICATIONS.SAVE_SETTINGS.TITLE")}`,
      `${this.translate("SETTINGS.COMMON.NOTIFICATIONS.SAVE_SETTINGS.BODY")}`,
      "check-square-o",
      10000
    );
  }

  /**
   * Shows notification when field value is wrong
   *
   * @param {*} field name of the field
   * @memberof NotificationMessagesService
   */
  public wrongValueProvided(field) {
    this.notificationService.notify(
      `${this.translate("COMMON.NOTIFICATIONS.WRONG_VALUE.TITLE")}`,
      `${field} ${this.translate("COMMON.NOTIFICATIONS.WRONG_VALUE.BODY")}`,
      "exclamation-triangle",
      5000
    );
  }

  /**
   *Shows notification when full backup file has been downloaded
   *
   * @memberof NotificationMessagesService
   */
  public fullBackup() {
    this.notificationService.notify(
      `${this.translate(
        "SETTINGS.BACKUP.NOTIFICATIONS.SAVE_FULL_BACKUP.TITLE"
      )}`,
      `${this.translate(
        "SETTINGS.BACKUP.NOTIFICATIONS.SAVE_FULL_BACKUP.BODY"
      )}`,
      "check-square-o",
      10000
    );
  }

  /**
   *Shows notification when full backup file has been downloaded
   *
   * @memberof NotificationMessagesService
   */
  public privateKeyBackup() {
    this.notificationService.notify(
      `${this.translate(
        "SETTINGS.BACKUP.NOTIFICATIONS.PRIVATE_KEY_BACKUP.TITLE"
      )}`,
      `${this.translate(
        "SETTINGS.BACKUP.NOTIFICATIONS.PRIVATE_KEY_BACKUP.BODY"
      )}`,
      "check-square-o",
      10000
    );
  }

  /**
   *Shows notification when seed phrase has been downloaded
   *
   * @memberof NotificationMessagesService
   */
  public simpleBackup() {
    this.notificationService.notify(
      `${this.translate(
        "SETTINGS.BACKUP.NOTIFICATIONS.SAVE_SIMPLE_BACKUP.TITLE"
      )}`,
      `${this.translate(
        "SETTINGS.BACKUP.NOTIFICATIONS.SAVE_SIMPLE_BACKUP.BODY"
      )}`,
      "check-square-o",
      10000
    );
  }

  /**
   * Shows notification when derivation path has been modified
   *
   * @param {string} derivation New derivation
   * @memberof NotificationMessagesService
   */
  public derivationModified(derivation: string) {
    this.notificationService.notify(
      `${this.translate(
        "SETTINGS.GENERAL.NOTIFICATIONS.CHANGE_DERIVATION.TITLE"
      )}`,
      `${this.translate(
        "SETTINGS.GENERAL.NOTIFICATIONS.CHANGE_DERIVATION.BODY"
      )} ${derivation}`,
      "check-square-o",
      10000
    );
  }

  /**
   *Shows notification when something copied to clipboard
   *
   * @memberof NotificationMessagesService
   */
  public valueCopiedToClipboard() {
    this.notificationService.notify(
      `${this.translate("NOTIFICATION")}`,
      `${this.translate("COPIED_TO_CLIPBOARD")}`,
      `${this.translate("CLIPBOARD")}`,
      5000
    );
  }

  /**
   * Shows notification when backup file type is not supported
   *
   * @memberof NotificationMessagesService
   */
  public fileNotSupported() {
    this.notificationService.notify(
      `${this.translate(
        "ACCOUNT.RESTORE.NOTIFICATIONS.FILE_NOT_SUPPORTED.TITLE"
      )}`,
      `${this.translate(
        "ACCOUNT.RESTORE.NOTIFICATIONS.FILE_NOT_SUPPORTED.BODY"
      )}`,
      "exclamation-triangle",
      5000
    );
  }

  /**
   *  Shows notification when seed file has wrong structure
   *
   * @memberof NotificationMessagesService
   */
  public wrongSeedFile() {
    this.notificationService.notify(
      `${this.translate(
        "ACCOUNT.RESTORE.NOTIFICATIONS.WRONG_SEED_FILE.TITLE"
      )}`,
      `${this.translate("ACCOUNT.RESTORE.NOTIFICATIONS.WRONG_SEED_FILE.BODY")}`,
      "exclamation-triangle",
      5000
    );
  }

  /**
   *  Shows notification when backup file has wrong structure
   *
   * @memberof NotificationMessagesService
   */
  public wrongBackupFile() {
    this.notificationService.notify(
      `${this.translate(
        "ACCOUNT.RESTORE.NOTIFICATIONS.WRONG_BACKUP_FILE.TITLE"
      )}`,
      `${this.translate(
        "ACCOUNT.RESTORE.NOTIFICATIONS.WRONG_BACKUP_FILE.BODY"
      )}`,
      "exclamation-triangle",
      5000
    );
  }

  /**
   *Shows notification
   *
   * @param title message title
   * @param body message body
   * @memberof NotificationMessagesService
   */
  public show(title: string, body: string) {
    this.notificationService.notify(
      this.translate(title),
      this.translate(body),
      "transaction",
      10000
    );
  }
}
