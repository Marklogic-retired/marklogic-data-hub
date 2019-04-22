import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MergeOption } from "../merge-options.model";
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from "@angular/forms";
import { WeightValidator } from '../../../../validators/weight.validator';
import { SourceWeightValidator } from '../../../../validators/source-weight.validator';
import { forOwn } from 'lodash';

export interface DialogData {
  stepName: string;
  stepType: string;
}

@Component({
  selector: 'app-add-merge-option-dialog',
  templateUrl: './add-merge-option-dialog.component.html',
  styleUrls: ['./add-merge-option-dialog.component.scss'],
})
export class AddMergeOptionDialogComponent {

  form: FormGroup;
  props: FormArray;
  selectedType: string;
  propertyName: string;
  sourceWeights: FormArray;
  strategies: any;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddMergeOptionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    console.log('this.data.option', this.data.option);
    this.form = this.fb.group({
      propertyName: [this.data.option ? this.data.option.propertyName : '',
        [Validators.required]],
      mergeType: [this.data.option ? this.data.option.mergeType : 'standard'],
      algorithmRef: [this.data.option ? this.data.option.algorithmRef : ''],
      maxValues: [this.data.option ? this.data.option.maxValues : '',
        [WeightValidator]],
      maxSources: [this.data.option ? this.data.option.maxSources : '',
        [WeightValidator]],
      length: [(this.data.option && this.data.option.length) ? this.data.option.length.weight : '',
        [WeightValidator]],
      strategy: [this.data.option ? this.data.option.strategy : ''],
      customUri: [this.data.option ? this.data.option.customUri : ''],
      customFunction: [this.data.option ? this.data.option.customFunction : ''],
      customNs: [this.data.option ? this.data.option.customNs : ''],
      index: this.data.index,
      entityProps:  [this.data.entityProps ? this.data.entityProps : []]
    })
    this.selectedType = (this.data.option && this.data.option.mergeType) ?
      this.data.option.mergeType : 'standard';
    this.strategies = (this.data.strategies && this.data.strategies.strategies) ?
      this.data.strategies.strategies.map(s => {
        if (!s.default) return s.name;
      }) : [];
    this.form.setControl('sourceWeights', this.createSourceWeights());
    this.sourceWeights = this.form.get('sourceWeights') as FormArray;
  }

  createSourceWeights() {
    if (!this.data.option || !this.data.option.sourceWeights) {
      return this.fb.array([this.createSourceWeight('', '')]);
    }
    const result = [];
    this.data.option.sourceWeights.forEach(sw => {
      result.push(this.createSourceWeight(sw.source.name, sw.source.weight))
    })
    return this.fb.array(result);
  }

  createSourceWeight(source, weight) {
    return this.fb.group({
      source: source,
      weight: weight
    }, { validators: SourceWeightValidator });
  }

  onAddSourceWeight() {
    const sourceWeights = this.form.get('sourceWeights') as FormArray;
    sourceWeights.push(this.createSourceWeight('', ''));
  }

  onRemoveSourceWeight(i) {
    const sourceWeights = this.form.get('sourceWeights') as FormArray;
    sourceWeights.removeAt(i);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  getDialogTitle(){
    return this.data.option ? 'Edit Merge Option' : 'New Merge Option';
  }

  getSubmitButtonTitle() {
    return this.data.option ? 'SAVE' : 'CREATE';
  }

  onSave() {
    const resultOption = new MergeOption(this.form.value);
    if (this.form.value.length) {
      resultOption.length = { weight: this.form.value.length };
    }
    resultOption.sourceWeights = this.getValidSourceWeights(this.form.value.sourceWeights);
    if (this.form.value.strategy) {
      this.addStrategy(resultOption, this.data.strategies);
    }
    this.dialogRef.close({opt: resultOption, index: this.form.value.index});
  }

  /**
   * Add strategy settings to option.
   */
  addStrategy(resultOption, strategies) {
    let str = strategies.strategies.find(s => {
      return s.name === resultOption.strategy;
    })
    if (str.algorithmRef) resultOption.algorithmRef = str.algorithmRef;
    if (str.maxValues) resultOption.maxValues = str.maxValues;
    if (str.maxSources) resultOption.maxSources = str.maxSources;
    if (str.sourceWeights) resultOption.sourceWeights = str.sourceWeights;
    if (str.length) resultOption.length = str.length;
  }

  /**
   * Build source-weight data structure from form data.
   */
  getValidSourceWeights(formSourceWeights) {
    let validSourceWeights = [];
    formSourceWeights.forEach(sw => {
      if (sw.source !== '' && sw.weight !== '' &&
          sw.source !== null && sw.weight !== null) {
        validSourceWeights.push({ source: sw.source, weight: sw.weight });
      }
    });
    return validSourceWeights;
  }

}
