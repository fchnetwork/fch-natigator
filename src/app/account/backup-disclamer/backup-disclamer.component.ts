import { ModalViewComponent, DialogRef } from '@aerum/ui';
import { Component, OnInit } from '@angular/core';
import { DefaultModalContext } from '@app/shared/modals/models/default-modal-context.model';

@Component({
  selector: 'app-backup-disclamer',
  templateUrl: './backup-disclamer.component.html',
  styleUrls: ['./backup-disclamer.component.scss']
})
export class BackupDisclamerComponent implements ModalViewComponent<any, any>, OnInit {

  constructor(public dialogRef: DialogRef<any, any>) {

  }

  ngOnInit() {
  }

}
