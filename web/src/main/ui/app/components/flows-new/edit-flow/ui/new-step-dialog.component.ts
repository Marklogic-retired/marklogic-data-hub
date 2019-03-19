import {Component, Inject, OnInit} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EditFlowUiComponent } from './edit-flow-ui.component';
import { Step } from '../../models/step.model';
import { Matching } from '../mastering/matching/matching.model';

export interface DialogData {
  title: string;
  databases: any;
  entities: any;
  collections: any;
  step: any;
}

@Component({
  selector: 'app-new-step-dialog',
  templateUrl: './new-step-dialog.component.html',
  styleUrls: ['./new-step-dialog.component.scss'],
})
export class NewStepDialogComponent implements OnInit {
  public newStep: Step = new Step;
  readonly stepOptions = ['ingestion', 'mapping', 'mastering', 'custom'];
  selectedSource: string = '';

  constructor(
    public dialogRef: MatDialogRef<EditFlowUiComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit() {
    if (this.data.step) {
      this.newStep = this.data.step;
    }
  }
  onNoClick(): void {
    this.dialogRef.close(false);
  }

}
