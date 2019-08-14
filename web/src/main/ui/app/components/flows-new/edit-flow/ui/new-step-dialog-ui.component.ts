import {Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Step, StepType, StepTypePurpose } from '../../models/step.model';
import {NewStepDialogValidator} from '../../validators/new-step-dialog.validator';
import {FlowsTooltips} from "../../tooltips/flows.tooltips";
import {
  ExistingStepNameValidator
} from "../../../common/form-validators/existing-step-name-validator";
import {CustomFieldValidator} from "../../../common";
import {Flow} from "../../models/flow.model";
import * as _ from 'lodash';
import {InstantErrorStateMatcher} from "../../validators/instant-error-match.validator";

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
  @Input() isUpdate: boolean;
  @Output() getCollections = new EventEmitter();
  @Output() cancelClicked = new EventEmitter();
  @Output() saveClicked = new EventEmitter();
  
  public newStep: Step;
  readonly stepOptions = Object.keys(StepType);

  readonly stepTypePurposeOptions = Object.keys(StepTypePurpose);
  readonly outputFormats = [
    {
      label: 'JSON',
      value: 'json',
    },
    {
      label: 'XML',
      value: 'xml',
    },
    {
      label: 'Text',
      value: 'text',
    },
    {
      label: 'Binary',
      value: 'binary',
    }
  ];

  instantErrorMatcher: InstantErrorStateMatcher;
  outputFormatOptions = [];
  newStepForm: FormGroup;
  additionalCollections: FormArray;
  databases: any = [];
  type: string = null;
  isIngestion: boolean = false;
  isMapping: boolean = false;
  isMastering: boolean = false;
  isCustom: boolean = false;
  sourceRequired: boolean = false;
  entityRequired: boolean = false;
  hasSelectedCollection: boolean = false;
  hasSelectedQuery: boolean = false;
  tooltips: any;
  options: FormArray;
  customStepType: any;
  cHmodule: string = '';
  cHparameters: any;
  cHuser: string =  '';
  cHrunBefore: string;
  private defaultOptions: any = ["additionalCollections",
        "collections",
        "headers",
        "outputFormat",
        "permissions",
        "sourceQuery",
        "sourceCollection",
        "sourceDatabase",
        "targetDatabase",
        "targetEntity"]

  constructor(
    private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.tooltips = FlowsTooltips.ingest;
    let selectedSource;
    this.databases = Object.values(this.databaseObject).slice(0, -1);
    
    if(this.step){
      this.step.stepDefType = this.createStepInitials(this.step);
    }
    if(this.step && this.step.stepDefType === 'CUSTOM'){
      this.customStepType = (this.createStepInitials(this.step) === StepType.CUSTOM ? (this.step.stepDefinitionType !== StepType.CUSTOM ? this.step.stepDefinitionType: 'OTHER'): '');
    }
    if(this.step && this.step.customHook){
      this.cHmodule = this.step.customHook['module'];
      this.cHparameters = JSON.stringify(this.step.customHook['parameters']);
      this.cHuser = this.step.customHook['user'];
      this.cHrunBefore = this.step.customHook['runBefore'] === true? "true": "false";
    }

    if (this.step) {
      this.newStep = this.step;
    }

    
    if (this.step && this.step.selectedSource)
      selectedSource = this.step.selectedSource;
    else {
      if (this.step && this.step.options && this.step.options.sourceQuery && !this.step.options.sourceCollection)
        selectedSource = 'query';
      else if (this.step && this.step.options && this.step.options.sourceCollection)
        selectedSource = 'collection';
    }

    this.instantErrorMatcher = new InstantErrorStateMatcher();
    this.hasSelectedCollection = selectedSource === 'collection';
    this.hasSelectedQuery = selectedSource === 'query';
    this.newStepForm = this.formBuilder.group({
      name: [this.step ? this.step.name : '', [
        Validators.required,
        Validators.pattern('[a-zA-Z][a-zA-Z0-9\_\-]*'),
        ExistingStepNameValidator.forbiddenName(this.flow, this.step && this.step.name)
      ]],
      stepDefinitionType: [this.step ? this.step.stepDefType : '', Validators.required],
      stepPurpose: [(this.step) ? this.customStepType : ''],
      description: [(this.step && this.step.description) ? this.step.description : ''],
      selectedSource: [(selectedSource) ? selectedSource : ''],
      sourceQuery: [(this.step && this.step.options.sourceQuery) ? this.step.options.sourceQuery : ''],
      sourceCollection: [(this.step && this.step.options.sourceCollection) ? this.step.options.sourceCollection : ''],
      targetEntity: [(this.step && this.step.options.targetEntity) ? this.step.options.targetEntity : ''],
      sourceDatabase: [(this.step && this.step.options.sourceDatabase) ? this.step.options.sourceDatabase : ''],
      targetDatabase: [(this.step && this.step.options.targetDatabase) ? this.step.options.targetDatabase : ''],
      outputFormat: [(this.step && this.step.options.outputFormat) ? this.step.options.outputFormat : 'json'],
      batchSize: [(this.step && this.step.batchSize) ? this.step.batchSize || 100 : 100, CustomFieldValidator.number({min: 1})],
      threadCount: [(this.step && this.step.threadCount) ? this.step.threadCount || 4 : 4, CustomFieldValidator.number({min: 1})],
      cHmodule: [(this.step && this.cHmodule) ? this.cHmodule : ''],
      cHparameters: [(this.step && this.cHparameters) ? this.cHparameters : JSON.stringify({},null,4)],
      cHuser: [(this.step && this.cHuser) ? this.cHuser : ''],
      cHrunBefore: [(this.step && this.cHrunBefore) ? this.cHrunBefore : "false"]
    }, { validators: NewStepDialogValidator });

    this.newStepForm.setControl('additionalCollections', this.createTargetCollections());
    this.additionalCollections = this.newStepForm.get('additionalCollections') as FormArray;
    this.newStepForm.setControl('options', this.createOptions());
    this.options = this.newStepForm.get('options') as FormArray;
 
    if (this.step && this.step.options && this.step.options.sourceDatabase)
      this.getCollections.emit(this.step.options.sourceDatabase);

    // Disable Type select and Name when editing a step
    if (this.isUpdate) {
      const type = this.newStepForm.getRawValue().stepDefinitionType;
      this.setType(type);
      this.newStepForm.controls['stepDefinitionType'].disable();
      this.newStepForm.controls['name'].disable();
      this.newStepForm.controls['stepPurpose'].disable();

      // Removing Target entity when editing


      if (this.newStep.options.hasOwnProperty('additionalCollections')) {
        this.newStep.options.collections = this.newStep.options.collections.filter(val => !this.newStep.options.additionalCollections.includes(val));
      }
      
      if (this.newStep.stepDefinitionType === StepType.MAPPING || this.newStep.stepDefinitionType === StepType.MASTERING || this.newStep.stepDefinitionType === StepType.CUSTOM ) {
        if (this.newStep.options.targetEntity) {
          this.newStep.options.collections = this.newStep.options.collections.filter(val => val !== this.newStep.options.targetEntity);
        }
      }
    }
  }
  getNameErrorMessage() {
    const errorCodes = [
      {code: 'required', message: 'You must enter a value.'},
      {code: 'pattern', message: 'Only letters, numbers, \"_\" and \"-\" allowed and must start with a letter.'},
      {code: 'forbiddenName', message: 'This step name already exists in the flow.'}
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
  stepSourceChange(event: any) {
    this.hasSelectedCollection = event.value === 'collection';
    this.hasSelectedQuery = event.value === 'query';
  }
  stepTypeChange() {
    const type = this.newStepForm.value.stepDefinitionType;
    if (type === StepType.MAPPING) {
      this.newStepForm.patchValue({
        sourceDatabase: this.databaseObject.staging,
        targetDatabase: this.databaseObject.final
      });
      this.tooltips = FlowsTooltips.mapping;
      this.newStep = Step.createMappingStep();
    }
    if (type === StepType.MASTERING) {
      this.newStepForm.patchValue({
        sourceDatabase: this.databaseObject.final,
        targetDatabase: this.databaseObject.final
      });
      this.tooltips = FlowsTooltips.mastering;
      this.newStep = Step.createMasteringStep();
    }
    if (type === StepType.CUSTOM) {
      this.newStepForm.patchValue({
        sourceDatabase: this.databaseObject.staging,
        targetDatabase: this.databaseObject.final
      });
      this.tooltips = FlowsTooltips.custom;
      this.newStep = Step.createCustomStep();
    }
    if (type === StepType.INGESTION) {
      this.newStepForm.patchValue({
        sourceDatabase: '',
        targetDatabase: this.databaseObject.staging
      });
      this.newStep = Step.createIngestionStep(this.projectDirectory);
      this.tooltips = FlowsTooltips.ingest;
    } else {
      this.getCollections.emit(this.newStepForm.value.sourceDatabase);
    }
    this.setType(type);

  }

  setType(type: string) {
    this.type = type;
    this.isIngestion = type === StepType.INGESTION;
    this.isCustom = type === StepType.CUSTOM;
    this.isMapping = type === StepType.MAPPING;
    this.isMastering = type === StepType.MASTERING;
    this.sourceRequired = this.isMapping || this.isMastering;
    this.entityRequired = this.isMapping || this.isMastering;

    if (this.isCustom) {
      this.outputFormatOptions = this.outputFormats;
    }
    if (this.isMapping || this.isMastering) {
      this.outputFormatOptions = this.outputFormats.slice(0, 2);
    }
  }
  
  setStepPurpose(){
    const type = this.newStepForm.value.stepPurpose;
    this.customStepType = type;

    this.newStep = Step.updateCustomStep(this.newStep,this.customStepType,this.projectDirectory);
  }
  onSave() {
    if (this.isUpdate) {
      this.newStep.name = this.newStepForm.getRawValue().name;
      this.newStep.stepDefType = this.newStepForm.getRawValue().stepDefinitionType;
        if(this.isCustom){
      this.newStep.stepDefinitionType = this.getStepDefValue(this.newStepForm.getRawValue().stepDefinitionType,this.newStepForm.getRawValue().stepPurpose);
       this.customStepType = this.newStepForm.getRawValue().stepPurpose;
      } else {
        this.newStep.stepDefinitionType = this.newStepForm.getRawValue().stepDefinitionType;
      }
    } else {
      this.newStep.name = this.newStepForm.value.name;
      
      if(this.isCustom){
      this.newStep.stepDefinitionType = this.getStepDefValue(this.newStepForm.value.stepDefinitionType,this.newStepForm.value.stepPurpose);
      this.customStepType = this.newStepForm.value.stepPurpose;
      } else {
        this.newStep.stepDefinitionType = this.newStepForm.value.stepDefinitionType;
      }
      this.newStep.stepDefType = this.newStepForm.value.stepDefinitionType;
    
    }

    if (this.newStep.stepDefType === StepType.CUSTOM) {
      this.newStep.stepDefinitionName = this.newStep.name;
   
    } else {
      this.newStep.stepDefinitionName = 'default-' + (this.newStep.stepDefType || '').toLowerCase();
    }
  
    this.newStep.description = this.newStepForm.value.description;
    this.newStep.selectedSource = this.newStepForm.value.selectedSource;
    if (this.newStep.selectedSource === 'query') {
      // Accept empty source query for custom step
      if (this.newStepForm.value.sourceQuery === '' && this.newStep.stepDefType === StepType.CUSTOM) {
        this.newStep.options.sourceQuery = 'cts.collectionQuery([])'; 
      } else {
        this.newStep.options.sourceQuery = this.newStepForm.value.sourceQuery;
      }
      this.newStep.options.sourceCollection = '';
    } else if (this.newStep.selectedSource === 'collection') {
      let ctsUri = `cts.collectionQuery([\"${this.newStepForm.value.sourceCollection}\"])`;
      // Accept empty source collection for custom step
      if (this.newStepForm.value.sourceCollection === '' && this.newStep.stepDefType === StepType.CUSTOM) {
        ctsUri = 'cts.collectionQuery([])';
      }
      this.newStep.options.sourceQuery = ctsUri;
      this.newStep.options.sourceCollection = this.newStepForm.value.sourceCollection;
    } else {
      this.newStep.options.sourceQuery = 'cts.collectionQuery([])';
      this.newStep.options.sourceCollection = '';
    }
    this.newStep.options.targetEntity = this.newStepForm.value.targetEntity;
    this.newStep.options.sourceDatabase = this.newStepForm.value.sourceDatabase;
    this.newStep.options.targetDatabase = this.newStepForm.value.targetDatabase;
    this.newStep.options.outputFormat = this.newStepForm.value.outputFormat;

    this.newStep.options.additionalCollections = this.getValidTargetCollections();
    this.setCollections();

    // Saving the new fields
   
    this.newStep.customHook = {"module": this.newStepForm.value.cHmodule,
                              "parameters": JSON.parse(this.newStepForm.value.cHparameters),
                              "user": this.newStepForm.value.cHuser,
                              "runBefore": this.newStepForm.value.cHrunBefore === "true"? true : false};

    this.newStep.batchSize = parseInt(this.newStepForm.value.batchSize);
    this.newStep.threadCount = parseInt(this.newStepForm.value.threadCount);
    
    if (this.isCustom) {
      const newOptions = this.newStepForm.value.options ? this.updateOptions(this.newStepForm.value.options) : [];
      
      let tempOptions = {};
      for (var key in this.newStep.options) {
        if (this.newStep.options.hasOwnProperty(key) && this.defaultOptions.includes(key)) {
          tempOptions[key] = this.newStep.options[key];
        }
      }
      this.newStep.options = Object.assign(tempOptions, newOptions);
    }

    if (this.newStep.name !== '') {
      this.saveClicked.emit(this.newStep);
    }
  }
  capitalFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  createTargetCollection(collection) {
    return this.formBuilder.group({
      addCollection: new FormControl (collection)
    });
  }
  createTargetCollections() {
    const result = [];
    if (this.isUpdate && this.step.options.hasOwnProperty('additionalCollections') && this.step.options.additionalCollections.length) {
      this.step.options.additionalCollections.forEach(collection => {
        result.push(this.createTargetCollection(collection));
      });
      return this.formBuilder.array(result);
    } else {
      return this.formBuilder.array([this.createTargetCollection('')]);
    }
  }
  onAddTargetCollection() {
    const additionalCollections = this.newStepForm.get('additionalCollections') as FormArray;
    additionalCollections.push(this.createTargetCollection(''));
  }
  onAddRemoveCollection(i) {
    const additionalCollections = this.newStepForm.get('additionalCollections') as FormArray;
    additionalCollections.removeAt(i);
  }

  getValidTargetCollections() {
    const validTargetCollections = new Set;
    this.newStepForm.value.additionalCollections.forEach( collection => {
      if (collection.addCollection) {
        validTargetCollections.add(collection.addCollection);
      }
    });
    return Array.from(validTargetCollections);
  }
  setCollections() {
    const collection = (this.isUpdate) ? this.newStepForm.getRawValue().name : this.newStepForm.value.name;

    if (!this.isUpdate) {
      switch (this.newStep.stepDefinitionType) {
        case StepType.INGESTION:
          this.newStep.options.collections = [collection];
          break;
          case StepType.MAPPING:
          case StepType.MASTERING:
          case StepType.CUSTOM:
          this.newStep.options.collections = [collection];
          if (this.newStep.options.targetEntity) {
            this.newStep.options.collections.push(this.newStep.options.targetEntity);
          }
          break;
        default:
          break;
      }
    } else {
      switch (this.newStep.stepDefinitionType) {
        case StepType.MAPPING:
        case StepType.MASTERING:
        case StepType.CUSTOM:
          if (this.newStep.options.targetEntity) {
            this.newStep.options.collections.push(this.newStep.options.targetEntity);
          }
          break;
        default:
          break;
      }
    }
    this.newStep.options.collections.push(...this.newStep.options.additionalCollections);
  }


  createOptions() {
    if (!this.step || !this.step.options) {
      return this.formBuilder.array([this.createOption('', '')]);
    }
    const result = [];
    _.forOwn(this.step.options, (value, key) => {
      if (!this.defaultOptions.includes(key)) {
      result.push(this.createOption(key, value))
          }
    });
    return this.formBuilder.array(result);
  }

  createOption(key, value) {
    return this.formBuilder.group({
      key: key,
      value: value
    });
  }

  onAddOption() {
    const options = this.newStepForm.get('options') as FormArray;
    options.push(this.createOption('', ''));
  }

  onRemoveOption(i) {
    const options = this.newStepForm.get('options') as FormArray;
    options.removeAt(i);
  }

  createStepInitials(step: any): string {
    if (step.stepDefinitionType === StepType.INGESTION){
      if(step.stepDefinitionName === 'default-ingestion'){
        return 'INGESTION';
      }
      else{
        return 'CUSTOM';
      }
    }
    else if (step.stepDefinitionType === StepType.MAPPING){
      if(step.stepDefinitionName === 'default-mapping'){
        return 'MAPPING';
      }
      else{
        return 'CUSTOM';
      }
    }
    else if (step.stepDefinitionType === StepType.MASTERING){
      if(step.stepDefinitionName === 'default-mastering'){
        return 'MASTERING';
      }
      else{
        return 'CUSTOM';
      }
    }
    else {
        return 'CUSTOM';
    }
  }

  getStepDefValue(stepDefType: StepType,CustomStepType: any): any{
    
    if(stepDefType === StepType.CUSTOM){

      switch(CustomStepType) {
        case StepType.INGESTION: 
                return StepType.INGESTION;
                break;
        case StepType.MAPPING: 
                return StepType.MAPPING;
                break;
        case StepType.MASTERING: 
                return StepType.MASTERING;
                break;
        default:
                return StepType.CUSTOM;
                break;
      }
    
    }
    else {
      return stepDefType;
    }
  }
  
  updateOptions(options: { key: string, value: string }[]) {
    const result = {};
    _.forEach(options, option => {
      if (option.key) {
        result[option.key] = option.value;
      }
    });
    return result;
  }


}
