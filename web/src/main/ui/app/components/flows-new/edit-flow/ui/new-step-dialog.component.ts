import {Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ManageFlowsService } from '../../services/manage-flows.service';
import { EditFlowUiComponent } from './edit-flow-ui.component';

export interface DialogData {
  title: string;
  databases: any;
  entities: any;
  step: any;
}
@Component({
  selector: 'app-new-step-dialog',
  template: `
  <app-new-step-dialog-ui
    [title]="data.title"
    [databaseObject]="data.databases"
    [entities]="data.entities"
    [collections]="collections"
    [step]="data.step"
    (getCollections)="getCollections($event)"
    (cancelClicked)="cancelClicked()"
    (saveClicked)="saveClicked($event)"
  ></app-new-step-dialog-ui>
`
})
export class NewStepDialogComponent {
  collections: string[] = [];
  constructor(
    public dialogRef: MatDialogRef<EditFlowUiComponent>,
    private manageFlowsService: ManageFlowsService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  getCollections(db) {
    this.manageFlowsService.getCollections(db).subscribe( resp => {
      this.collections = resp;
    });
  }
  saveClicked(newStep) {
    this.dialogRef.close(newStep);
  }
  cancelClicked(): void {
    this.dialogRef.close(false);
  }
}
