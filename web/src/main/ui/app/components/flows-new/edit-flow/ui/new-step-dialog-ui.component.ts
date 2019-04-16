import {Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Step } from '../../models/step.model';
import { Options } from '../../models/step-options.model';
import { Matching } from '../mastering/matching/matching.model';
import { Merging } from '../mastering/merging/merging.model';
import {NewStepDialogValidator} from '../../validators/new-step-dialog.validator';
import {
  ExistingStepNameValidator
} from "../../../common/form-validators/existing-step-name-validator";
import {Flow} from "../../models/flow.model";

@Component({
  selector: 'app-new-step-dialog-ui',
  templateUrl: './new-step-dialog-ui.component.html',
  styleUrls: ['./new-step-dialog-ui.component.scss'],
})
export class NewStepDialogUiComponent implements OnInit {
  @Input() title: any;
  @Input() databaseObject: any;
  @Input() entities: any;
  @Input() collections: any;
  @Input() step: any;
  @Input() flow: Flow;
  @Output() getCollections = new EventEmitter();
  @Output() cancelClicked = new EventEmitter();
  @Output() saveClicked = new EventEmitter();

  public newStep: Step = new Step;
  readonly stepOptions = ['ingest', 'mapping', 'mastering', 'custom'];

  selectedSource = '';
  newStepForm: FormGroup;
  databases: any = [];
  constructor(
    private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.databases = Object.values(this.databaseObject).slice(0, -1);
    this.newStep.options = new Options;
    this.newStep.options.matchOptions = new Matching;
    this.newStep.options.mergeOptions = new Merging;

    if (this.step) {
      this.newStep = this.step;
    }
    this.newStepForm = this.formBuilder.group({
      name: [this.step ? this.step.name : '', [
        Validators.required,
        Validators.pattern('[a-zA-Z][a-zA-Z0-9\_\-]*'),
        ExistingStepNameValidator.forbiddenName(this.flow)
      ]],
      type: [this.step ? this.step.type : '', Validators.required],
      description: [this.step ? this.step.description : ''],
      sourceQuery: [this.step ? this.step.options.sourceQuery : ''],
      sourceCollection: [this.step ? this.step.options.sourceCollection : ''],
      targetEntity: [this.step ? this.step.options.targetEntity : ''],
      sourceDatabase: [this.step ? this.step.sourceDatabase : ''],
      targetDatabase: [this.step ? this.step.targetDatabase : '']
    }, { validators: NewStepDialogValidator });
    if (this.step && this.step.options.sourceCollection) {
      this.selectedSource = 'collection';
    } else if (this.step && this.step.options.sourceQuery) {
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
    this.cancelClicked.emit();
  }
  stepTypeChange() {
    const type = this.newStepForm.value.type;
    if (type === 'mapping') {
      this.newStepForm.patchValue({
        sourceDatabase: this.databaseObject.staging,
        targetDatabase: this.databaseObject.final
      });
    }
    if (type === 'mastering') {
      this.newStepForm.patchValue({
        sourceDatabase: this.databaseObject.final,
        targetDatabase: this.databaseObject.final
      });
    }
    if (type === 'custom') {
      this.newStepForm.patchValue({
        sourceDatabase: this.databaseObject.staging,
        targetDatabase: this.databaseObject.final
      });
    }
    if (type === 'ingest') {
      this.newStepForm.patchValue({
        sourceDatabase: '',
        targetDatabase: this.databaseObject.staging
      });
    } else {
      this.getCollections.emit(this.newStepForm.value.sourceDatabase);
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

    if (this.newStep.name !== '' && this.newStep.type !== '') {
      this.saveClicked.emit(this.newStep);
    }
  }
}
