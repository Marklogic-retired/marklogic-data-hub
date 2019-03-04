import {Component, Inject, OnInit} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EditFlowUiComponent } from './edit-flow-ui.component';
import { Step } from '../../models/step.model';

export interface DialogData {
  databases: any;
}

@Component({
  selector: 'app-new-step-dialog',
  templateUrl: './new-step-dialog.component.html',
  styleUrls: ['./new-step-dialog.component.scss'],
})
export class NewStepDialogComponent {
  public newStep: Step = new Step;
  readonly stepOptions = ['ingestion', 'mapping', 'mastering', 'custom'];
  selectedSource: string = '';

  constructor(
    public dialogRef: MatDialogRef<EditFlowUiComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

}