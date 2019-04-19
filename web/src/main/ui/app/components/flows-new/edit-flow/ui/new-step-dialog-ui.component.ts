import {Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Step, StepType } from '../../models/step.model';
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
  @Input() projectDirectory: string;
  @Output() getCollections = new EventEmitter();
  @Output() cancelClicked = new EventEmitter();
  @Output() saveClicked = new EventEmitter();

  public newStep: Step;
  public stepType: typeof StepType = StepType;
  readonly stepOptions = Object.keys(this.stepType);

  selectedSource = '';
  newStepForm: FormGroup;
  databases: any = [];
  constructor(
    private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.databases = Object.values(this.databaseObject).slice(0, -1);
    if (this.step) {
      this.newStep = this.step;
    }
    this.newStepForm = this.formBuilder.group({
      name: [this.step ? this.step.name : '', [
        Validators.required,
        Validators.pattern('[a-zA-Z][a-zA-Z0-9\_\-]*'),
        ExistingStepNameValidator.forbiddenName(this.flow, this.step && this.step.name)
      ]],
      stepDefinitionType: [this.step ? this.step.stepDefinitionType : '', Validators.required],
      description: [this.step ? this.step.description : ''],
      sourceQuery: [this.step ? this.step.options.sourceQuery : ''],
      sourceCollection: [this.step ? this.step.options.sourceCollection : ''],
      targetEntity: [this.step ? this.step.options.targetEntity : ''],
      sourceDatabase: [this.step ? this.step.options.sourceDatabase : ''],
      targetDatabase: [this.step ? this.step.options.targetDatabase : '']
    }, { validators: NewStepDialogValidator });

    if (this.step && this.step.options && this.step.options.sourceDatabase)
      this.getCollections.emit(this.step.options.sourceDatabase);

    if (this.step && this.step.options && this.step.options.sourceCollection) {
      this.selectedSource = 'collection';
    } else if (this.step && this.step.options && this.step.options.sourceQuery) {
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
    const type = this.newStepForm.value.stepDefinitionType;
    if (type === this.stepType.MAPPING) {
      this.newStepForm.patchValue({
        sourceDatabase: this.databaseObject.staging,
        targetDatabase: this.databaseObject.final
      });
      this.newStep = Step.createMappingStep();
    }
    if (type === this.stepType.MASTERING) {
      this.newStepForm.patchValue({
        sourceDatabase: this.databaseObject.final,
        targetDatabase: this.databaseObject.final
      });
      this.newStep = Step.createMasteringStep();
    }
    if (type === this.stepType.CUSTOM) {
      this.newStepForm.patchValue({
        sourceDatabase: this.databaseObject.staging,
        targetDatabase: this.databaseObject.final
      });
      this.newStep = Step.createCustomStep();
    }
    if (type === this.stepType.INGESTION) {
      this.newStepForm.patchValue({
        sourceDatabase: '',
        targetDatabase: this.databaseObject.staging
      });
      this.newStep = Step.createIngestionStep(this.projectDirectory);
    } else {
      this.getCollections.emit(this.newStepForm.value.sourceDatabase);
    }
  }
  onSave() {
    this.newStep.name = this.newStepForm.value.name;
    this.newStep.stepDefinitionType = this.newStepForm.value.stepDefinitionType;
    this.newStep.stepDefinitionName = 'default-' + (this.newStepForm.value.stepDefinitionType || '').toLowerCase();
    this.newStep.description = this.newStepForm.value.description;
    if (this.selectedSource === 'query') {
      this.newStep.options.sourceQuery = this.newStepForm.value.sourceQuery;
      this.newStep.options.sourceCollection = '';
    } else {
      const ctsUri = `cts.uris(null, null, cts.collectionQuery([\"${this.newStepForm.value.sourceCollection}\"]))`;
      this.newStep.options.sourceQuery = ctsUri;
      this.newStep.options.sourceCollection = this.newStepForm.value.sourceCollection;
    }
    this.newStep.options.targetEntity = this.newStepForm.value.targetEntity;
    this.newStep.options.sourceDatabase = this.newStepForm.value.sourceDatabase;
    this.newStep.options.targetDatabase = this.newStepForm.value.targetDatabase;

    if (this.newStep.name !== '') {
      this.saveClicked.emit(this.newStep);
    }
  }
}
