import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {EditFlowUiComponent} from './edit-flow-ui.component';
import {Step} from '../../models/step.model';
import {Options} from '../../models/step-options.model';
import {Matching} from '../mastering/matching/matching.model';
import {Merging} from '../mastering/merging/merging.model';
import {NewStepDialogValidator} from '../../validators/new-step-dialog.validator';
import {
  ExistingStepNameValidator
} from "../../../common/form-validators/existing-step-name-validator";
import {Flow} from "../../models/flow.model";

export interface DialogData {
  title: string;
  databases: any;
  entities: any;
  collections: any;
  step: any;
  flow: Flow;
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
  selectedSource = '';
  newStepForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditFlowUiComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
  }

  ngOnInit() {
    this.newStep.options = new Options;
    this.newStep.options.matchOptions = new Matching;
    this.newStep.options.mergeOptions = new Merging;

    if (this.data.step) {
      this.newStep = this.data.step;
    }
    this.newStepForm = this.formBuilder.group({
      name: [this.data.step ? this.data.step.name : '', [
        Validators.required,
        Validators.pattern('[a-zA-Z][a-zA-Z0-9\_\-]*'),
        ExistingStepNameValidator.forbiddenName(this.data.flow)
      ]],
      type: [this.data.step ? this.data.step.type : '', Validators.required],
      description: [this.data.step ? this.data.step.description : ''],
      sourceQuery: [this.data.step ? this.data.step.options.sourceQuery : ''],
      sourceCollection: [this.data.step ? this.data.step.options.sourceCollection : ''],
      targetEntity: [this.data.step ? this.data.step.options.targetEntity : ''],
      sourceDatabase: [this.data.step ? this.data.step.sourceDatabase : ''],
      targetDatabase: [this.data.step ? this.data.step.targetDatabase : '']
    }, { validators: NewStepDialogValidator });
    if (this.data.step && this.data.step.options.sourceCollection) {
      this.selectedSource = 'collection';
    } else if (this.data.step && this.data.step.options.sourceQuery) {
      this.selectedSource = 'query';
    }
  }

  getNameErrorMessage() {
    const errorCodes = [
      {code: 'required', message: 'You must enter a value'},
      {code: 'pattern', message: 'Not a valid name. It must start with a symbol, have zero or more alphanumeric characters. Only \'_\' or \'-\' are allowed.'},
      {code: 'forbiddenName', message: 'This name already exist in the flow'}
    ];
    const nameCtrl = this.newStepForm.get('name');
    if (!nameCtrl) {
      return ''
    }
    const err = errorCodes.find( err => nameCtrl.hasError(err.code));
    return err ? err.message : '';
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
    }
    if (type === 'mapping') {
      this.newStepForm.patchValue({
        sourceDatabase: this.data.databases.staging,
        targetDatabase: this.data.databases.final
      });
    }
    if (type === 'mastering') {
      this.newStepForm.patchValue({
        sourceDatabase: this.data.databases.final,
        targetDatabase: this.data.databases.final
      });
    }
    if (type === 'custom') {
      this.newStepForm.patchValue({
        sourceDatabase: this.data.databases.staging,
        targetDatabase: this.data.databases.final
      });
    }
  }

  onSave() {
    this.newStep.name = this.newStepForm.value.name;
    this.newStep.type = this.newStepForm.value.type;
    this.newStep.description = this.newStepForm.value.description;
    if (this.selectedSource === 'collection') {
      this.newStep.options.sourceCollection = this.newStepForm.value.sourceCollection;
      this.newStep.options.sourceQuery = '';
    }
    if (this.selectedSource === 'query') {
      this.newStep.options.sourceCollection = '';
      this.newStep.options.sourceQuery = this.newStepForm.value.sourceQuery;
    }
    this.newStep.options.targetEntity = this.newStepForm.value.targetEntity;
    this.newStep.sourceDatabase = this.newStepForm.value.sourceDatabase;
    this.newStep.targetDatabase = this.newStepForm.value.targetDatabase;
    this.dialogRef.close(this.newStep);
  }

}
