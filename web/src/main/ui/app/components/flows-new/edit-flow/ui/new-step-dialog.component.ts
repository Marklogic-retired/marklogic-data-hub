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
  public databases = Object.values(this.data.databases).slice(0, -1);
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
  stepTypeChange(type) {
    if (type === 'ingestion') {
      this.newStep.sourceDatabase = '';
      this.newStep.targetDatabase = this.data.databases.staging;
    }
    if (type === 'mapping') {
      this.newStep.sourceDatabase = this.data.databases.staging;
      this.newStep.targetDatabase = this.data.databases.final;
    }
    if (type === 'mastering') {
      this.newStep.sourceDatabase = this.data.databases.final;
      this.newStep.targetDatabase = this.data.databases.final;
    }
    if (type === 'custom') {
      this.newStep.sourceDatabase = this.data.databases.staging;
      this.newStep.targetDatabase = this.data.databases.final;
    }
  }
  targetEntityChange(entity) {
    this.newStep.config['targetEntity'] = entity;
  }
}
