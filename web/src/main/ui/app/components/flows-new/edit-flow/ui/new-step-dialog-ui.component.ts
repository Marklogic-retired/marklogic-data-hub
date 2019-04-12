import {Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Step } from '../../models/step.model';
import { Options } from '../../models/step-options.model';
import { Matching } from '../mastering/matching/matching.model';
import { Merging } from '../mastering/merging/merging.model';


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
      name: [this.step ? this.step.name : '', Validators.required],
      type: [this.step ? this.step.type : '', Validators.required],
      description: [this.step ? this.step.description : ''],
      sourceQuery: [this.step ? this.step.options.sourceQuery : ''],
      sourceCollection: [this.step ? this.step.options.sourceCollection : ''],
      targetEntity: [this.step ? this.step.options.targetEntity : ''],
      sourceDatabase: [this.step ? this.step.sourceDatabase : ''],
      targetDatabase: [this.step ? this.step.targetDatabase : '']
    });
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
    this.newStep.options.sourceQuery = this.newStepForm.value.sourceQuery;
    this.newStep.options.sourceCollection = this.newStepForm.value.sourceCollection;
    this.newStep.options.targetEntity = this.newStepForm.value.targetEntity;
    this.newStep.sourceDatabase = this.newStepForm.value.sourceDatabase;
    this.newStep.targetDatabase = this.newStepForm.value.targetDatabase;

    if (this.newStep.name !== '' && this.newStep.type !== '') {
      this.saveClicked.emit(this.newStep);
    }
  }
}
