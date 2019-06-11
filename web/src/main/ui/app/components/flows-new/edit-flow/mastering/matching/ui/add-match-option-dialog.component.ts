import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatchOption } from "../match-options.model";
import {FormBuilder, FormGroup, FormArray, FormControl, Validators, ValidatorFn} from "@angular/forms";
import { WeightValidator } from '../../../../validators/weight.validator';
import { AddMatchOptionValidator } from '../../../../validators/add-match-option.validator';
import { forOwn } from 'lodash';
import {InstantErrorStateMatcher} from "../../../../validators/instant-error-match.validator";
import {FlowsTooltips} from "../../../../tooltips/flows.tooltips";

export interface DialogData {
  stepName: string;
  stepType: string;
}

@Component({
  selector: 'app-add-match-option-dialog',
  templateUrl: './add-match-option-dialog.component.html',
  styleUrls: ['./add-match-option-dialog.component.scss'],
})
export class AddMatchOptionDialogComponent {
  instantErrorMatcher: InstantErrorStateMatcher;
  tooltips: any;
  form: FormGroup;
  props: FormArray;
  selectedType: string;
  propertiesReduce: FormArray;
  weightValidators: Array<ValidatorFn> = [Validators.required, WeightValidator];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddMatchOptionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.tooltips = FlowsTooltips.mastering.matching;
    this.form = this.fb.group({
      propertyName: [this.data.option ? this.data.option.propertyName[0] : ''],
      matchType: [this.data.option ? this.data.option.matchType : 'exact'],
      weight: [this.data.option ? this.data.option.weight : ''],
      thesaurus: [this.data.option ? this.data.option.thesaurus : ''],
      filter: [this.data.option ? this.data.option.filter : ''],
      dictionary: [this.data.option ? this.data.option.dictionary : ''],
      distanceThreshold: [this.data.option ? this.data.option.distanceThreshold : ''],
      collation: [this.data.option ? this.data.option.collation : ''],
      zip5match9: [this.data.option ? this.data.option.zip5match9 : ''],
      zip9match5: [this.data.option ? this.data.option.zip9match5 : ''],
      customUri: [this.data.option ? this.data.option.customUri : ''],
      customFunction: [this.data.option ? this.data.option.customFunction : ''],
      customNs: [this.data.option ? this.data.option.customNs : ''],
      index: this.data.index,
      entityProps:  [this.data.entityProps ? this.data.entityProps : []]
    }, { validators: AddMatchOptionValidator })
    this.selectedType = (this.data.option && this.data.option.matchType) ?
      this.data.option.matchType : 'exact';
    this.form.setControl('propertiesReduce', this.createProps());
    this.propertiesReduce = this.form.get('propertiesReduce') as FormArray;
    this.instantErrorMatcher = new InstantErrorStateMatcher();
    this.selectedTypeChanged();
  }

  selectedTypeChanged() {
    const weightControl = this.form.get('weight');
    console.log("weightControl", weightControl)
    const zip5match9Control = this.form.get('zip5match9');
    const zip9match5Control = this.form.get('zip9match5');
    const thesaurusControl = this.form.get('thesaurus');
    const dictionaryControl = this.form.get('dictionary');
    const distanceThresholdControl = this.form.get('distanceThreshold');
    const customUriControl = this.form.get('customUri');
    const customFunctionControl = this.form.get('customFunction');
    if(this.selectedType === 'synonym'){
      thesaurusControl.setValidators(Validators.required);
    }else {
      thesaurusControl.clearValidators();
      thesaurusControl.reset();
    }
    if(this.selectedType === 'double metaphone'){
      dictionaryControl.setValidators(Validators.required);
      distanceThresholdControl.setValidators(Validators.required);
    }else {
      dictionaryControl.clearValidators();
      dictionaryControl.reset();
      distanceThresholdControl.clearValidators();
      distanceThresholdControl.reset();
    }
    if(this.selectedType === 'custom'){
      customUriControl.setValidators(Validators.required);
      customFunctionControl.setValidators(Validators.required)
    }else{
      customUriControl.clearValidators();
      customUriControl.reset();
      distanceThresholdControl.clearValidators();
      distanceThresholdControl.reset();
    }
    if (this.selectedType === 'zip') {
      zip5match9Control.setValidators(this.weightValidators);
      zip9match5Control.setValidators(this.weightValidators);
      weightControl.clearValidators();
      weightControl.reset();
    } else {
      weightControl.setValidators(this.weightValidators);
      zip5match9Control.clearValidators();
      zip5match9Control.reset();
      zip9match5Control.clearValidators();
      zip9match5Control.reset();
    }
  }

  createProps() {
    if (!this.data.option || !this.data.option.propertyName) {
      return this.fb.array([this.createProp('')]);
    }
    const result = [];
    this.data.option.propertyName.forEach(name => {
      result.push(this.createProp(name))
    })
    return this.fb.array(result);
  }

  createProp(name) {
    return this.fb.group({
      name: name
    });
  }

  onAddProp() {
    const props = this.form.get('propertiesReduce') as FormArray;
    props.push(this.createProp(''));
  }

  onRemoveProp(i) {
    const props = this.form.get('propertiesReduce') as FormArray;
    props.removeAt(i);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  getDialogTitle(){
    return this.data.option ? 'Edit Match Option' : 'New Match Option';
  }

  getSubmitButtonTitle() {
    return this.data.option ? 'SAVE' : 'CREATE';
  }

  getMatchType() {
    return (this.data.option && this.data.option.matchType) ?
      this.data.option.matchType : 'exact';
  }

  onSave() {
    this.dialogRef.close(this.form.value);
  }

}
