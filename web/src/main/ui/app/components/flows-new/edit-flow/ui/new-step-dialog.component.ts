import {Component, Inject, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EditFlowUiComponent } from './edit-flow-ui.component';
import { Step } from '../../models/step.model';

export interface DialogData {
  title: string;
  databases: any;
  entities: any;
  collections: any;
  step: any;
  projectDirectory: string;
}

@Component({
  selector: 'app-new-step-dialog',
  templateUrl: './new-step-dialog.component.html',
  styleUrls: ['./new-step-dialog.component.scss'],
})
export class NewStepDialogComponent implements OnInit {

  public newStep: Step = new Step;
  readonly stepOptions = ['ingest', 'mapping', 'mastering', 'custom'];
  public databases = Object.values(this.data.databases).slice(0, -1);
  selectedSource = '';
  newStepForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditFlowUiComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit() {
    if (this.data.step) {
      this.newStep = this.data.step;
    }
    this.newStepForm = this.formBuilder.group({
      name: [this.data.step ? this.data.step.name : '', Validators.required],
      type: [this.data.step ? this.data.step.type : '', Validators.required],
      description: [this.data.step ? this.data.step.description : ''],
      sourceQuery: [this.data.step ? this.data.step.options.sourceQuery : ''],
      sourceCollection: [this.data.step ? this.data.step.options.sourceCollection : ''],
      targetEntity: [this.data.step ? this.data.step.options.targetEntity : ''],
      sourceDatabase: [this.data.step ? this.data.step.sourceDatabase : ''],
      targetDatabase: [this.data.step ? this.data.step.targetDatabase : '']
    });
  }
  onNoClick(): void {
    this.dialogRef.close(false);
  }
  stepTypeChange() {
    const type = this.newStepForm.value.type;
    if (type === 'ingest') {
      this.newStepForm.patchValue({
        sourceDatabase: '',
        targetDatabase: this.data.databases.staging
      });
      this.newStep.stepOption = 'ingest';
      this.newStep.options.projectDirectory = this.data.projectDirectory;
    }
    if (type === 'mapping') {
      this.newStepForm.patchValue({
        sourceDatabase: this.data.databases.staging,
        targetDatabase: this.data.databases.final
      });
      this.newStep.stepOption = 'mapping';
    }
    if (type === 'mastering') {
      this.newStepForm.patchValue({
        sourceDatabase: this.data.databases.final,
        targetDatabase: this.data.databases.final
      });
      this.newStep.stepOption = 'mastering';
    }
    if (type === 'custom') {
      this.newStepForm.patchValue({
        sourceDatabase: this.data.databases.staging,
        targetDatabase: this.data.databases.final
      });
      this.newStep.stepOption = 'custom';
    }
  }
  onSave() {
    this.newStep.name = this.newStepForm.value.name;
    this.newStep.type = this.newStepForm.value.type;
    this.newStep.description = this.newStepForm.value.description;
    this.newStep.options.sourceQuery = this.newStepForm.value.sourceQuery;
    this.newStep.options.targetEntity = this.newStepForm.value.targetEntity;
    this.newStep.sourceDatabase = this.newStepForm.value.sourceDatabase;
    this.newStep.targetDatabase = this.newStepForm.value.targetDatabase;

    if (this.newStep.name !== '' && this.newStep.type !== '') {
      this.dialogRef.close(this.newStep);
    }
  }
}
