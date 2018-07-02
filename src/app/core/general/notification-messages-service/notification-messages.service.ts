import { Injectable } from '@angular/core';
import { NotificationService } from '@aerum/ui';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class NotificationMessagesService {

constructor(private notificationService: NotificationService,
            private translateService: TranslateService) { }

    protected translate(key: string): string {
        return this.translateService.instant(key);
    }

    /**
     *Shows notification when transaction status has changed to SUCCESSFULL
     *
     * @param {*} hash Transaction hash
     * @memberof NotificationMessagesService
     */
    public succefullSentNotification(hash) {
        this.notificationService.notify(
            `${this.translate('SEND_RECEIVE.NOTIFICATION_TITLE_TRANSACTION_STATUS')}: ${this.translate('SEND_RECEIVE.STATUSES.SUCCESFULLY_SENT')}`,
            `${this.translate('SEND_RECEIVE.TRANSACTION')} ${hash} ${this.translate('SEND_RECEIVE.IS')} ${this.translate('SEND_RECEIVE.STATUSES.SUCCESFULLY_SENT')}`,
          'transaction', 
          10000
        );
      }
  
      /**
       *Shows notification when transaction has failed
       *
       * @memberof NotificationMessagesService
       */
      public failedTransactionNotification() {
        this.notificationService.notify(
          `${this.translate('SEND_RECEIVE.NOTIFICATION_TITLE_TRANSACTION_STATUS')}: ${this.translate('SEND_RECEIVE.STATUSES.FAILED')}`, 
          this.translate('SEND_RECEIVE.STATUSES.FAILED'), 
          'aerumleaf', 
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
          `${this.translate('SEND_RECEIVE.NOTIFICATION_TITLE_TRANSACTION_STATUS')}: ${this.translate('SEND_RECEIVE.STATUSES.PENDING')}`, 
          `${this.translate('SEND_RECEIVE.TRANSACTION')} ${hash} ${this.translate('SEND_RECEIVE.IS')} ${this.translate('SEND_RECEIVE.STATUSES.PENDING')}`,
          'pending', 
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
          `${this.translate('SEND_RECEIVE.NOTIFICATION_TITLE_TRANSACTION_STATUS')}: ${this.translate('SEND_RECEIVE.STATUSES.MINED')}`, 
          `${this.translate('SEND_RECEIVE.TRANSACTION')} ${hash} ${this.translate('SEND_RECEIVE.HAS_BEEN')} ${this.translate('SEND_RECEIVE.STATUSES.MINED')}`,
          'pending', 
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
          `${this.translate('CONNECTION.CONNECTION_STATUS')}: ${this.translate('CONNECTION.STATUS_TITLE.DISCONNECTED')}`, 
          this.translate('CONNECTION.STATUS_BODY.DISCONNECTED'), 
          'blocks', 
          10000
        );
      }

      /**
       *Shows notification when Aerum CONNECTED to network
       *
       * @memberof NotificationMessagesService
       */
      public connectionConnected() {
        this.notificationService.notify(
          `${this.translate('CONNECTION.CONNECTION_STATUS')}: ${this.translate('CONNECTION.STATUS_TITLE.CONNECTED')}`,
          this.translate('CONNECTION.STATUS_BODY.CONNECTED'), 
          'blocks', 
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
          `${this.translate('SETTINGS.LANGUAGE.NOTIFICATION_TITLE_CHANGE_LANGUAGE')}`, 
          `${this.translate('SETTINGS.LANGUAGE.NOTIFICATION_BODY_CHANGE_LANGUAGE')} ${language}`,
          'translation', 
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
          `${this.translate('EXTERNAL_TRANSACTION.NOTIFICATION_TITLE_TOKEN_NOT_IN_WALLET')}`, 
          `${this.translate('EXTERNAL_TRANSACTION.NOTIFICATION_BODY_TOKEN_NOT_IN_WALLET')}`,
          'info', 
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
          `${this.translate('EXTERNAL_TRANSACTION.NOTIFICATION_TITLE_TOKEN_NOT_CONFIGURED')}`, 
          `${this.translate('EXTERNAL_TRANSACTION.NOTIFICATION_BODY_TOKEN_NOT_CONFIGURED')}`,
          'exclamation-triangle', 
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
          `${this.translate('SETTINGS.NOTIFICATION_TITLE_SAVE_SETTINGS')}`, 
          `${this.translate('SETTINGS.NOTIFICATION_BODY_SAVE_SETTINGS')}`,
          'check-square-o', 
          10000
        );
      }

      /**
       *Shows notification when full backup file has been downloaded
       *
       * @memberof NotificationMessagesService
       */
      public fullBackup() {
        this.notificationService.notify(
          `${this.translate('SETTINGS.BACKUP.NOTIFICATION_TITLE_SAVE_FULL_BACKUP')}`, 
          `${this.translate('SETTINGS.BACKUP.NOTIFICATION_BODY_SAVE_FULL_BACKUP')}`,
          'check-square-o', 
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
          `${this.translate('SETTINGS.BACKUP.NOTIFICATION_TITLE_SAVE_SIMPLE_BACKUP')}`, 
          `${this.translate('SETTINGS.BACKUP.NOTIFICATION_BODY_SAVE_SIMPLE_BACKUP')}`,
          'check-square-o', 
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
          `Notification`, 
          `Value has been copied to clipboard`,
          'clipboard', 
          5000
        );
      }
}
