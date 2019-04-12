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

  public newStep: Step;
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
      this.newStep = new Step('ingest', this.data.projectDirectory);
    }
    if (type === 'mapping') {
      this.newStepForm.patchValue({
        sourceDatabase: this.data.databases.staging,
        targetDatabase: this.data.databases.final
      });
      this.newStep = new Step('mapping', this.data.projectDirectory);
    }
    if (type === 'mastering') {
      this.newStepForm.patchValue({
        sourceDatabase: this.data.databases.final,
        targetDatabase: this.data.databases.final
      });
      this.newStep = new Step('mastering', this.data.projectDirectory);
    }
    if (type === 'custom') {
      this.newStepForm.patchValue({
        sourceDatabase: this.data.databases.staging,
        targetDatabase: this.data.databases.final
      });
      this.newStep = new Step('custom', this.data.projectDirectory);
    }
  }
  onSave() {
    const stepOptions = {
      name: this.newStepForm.value.name,
      description: this.newStepForm.value.description,
      sourceQuery: this.newStepForm.value.sourceQuery,
      targetEntity: this.newStepForm.value.targetEntity,
      sourceDatabase: this.newStepForm.value.sourceDatabase,
      targetDatabase: this.newStepForm.value.targetDatabase,
    };
    this.newStep.stepOptions = stepOptions;

    if (this.newStep.stepName !== '' && this.newStep.stepType !== '') {
      this.dialogRef.close(this.newStep);
    }
  }
}
