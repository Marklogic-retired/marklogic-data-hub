import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MergeStrategy } from "../merge-strategies.model";
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from "@angular/forms";
import { AddMergeStrategyValidator } from '../../../../validators/add-merge-strategy.validator';
import { WeightValidator } from '../../../../validators/weight.validator';
import { SourceWeightValidator } from '../../../../validators/source-weight.validator';
import { forOwn } from 'lodash';

export interface DialogData {
  stepName: string;
  stepType: string;
}

@Component({
  selector: 'app-add-merge-strategy-dialog',
  templateUrl: './add-merge-strategy-dialog.component.html',
  styleUrls: ['./add-merge-strategy-dialog.component.scss'],
})
export class AddMergeStrategyDialogComponent {

  form: FormGroup;
  props: FormArray;
  sourceWeights: FormArray;
  selectedDefault: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddMergeStrategyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    console.log('this.data.strategy', this.data.strategy);
    this.form = this.fb.group({
      // Clear name if default strategy
      name: [this.data.strategy && !this.data.strategy.default ? this.data.strategy.name : ''],
      default: [this.data.strategy && this.data.strategy.default ? 'true' : 'false'],
      algorithmRef: [this.data.strategy ? this.data.strategy.algorithmRef : ''],
      maxValues: [this.data.strategy ? this.data.strategy.maxValues : '',
        [WeightValidator]],
      maxSources: [this.data.strategy ? this.data.strategy.maxSources : '',
        [WeightValidator]],
      length: [(this.data.strategy && this.data.strategy.length) ? this.data.strategy.length.weight : '',
        [WeightValidator]],
      customUri: [this.data.strategy ? this.data.strategy.customUri : ''],
      customFunction: [this.data.strategy ? this.data.strategy.customFunction : ''],
      index: this.data.index
    }, { validators: AddMergeStrategyValidator })
    this.selectedDefault = (this.data.strategy && this.data.strategy.default) ?
      'true' : 'false';
    this.form.setControl('sourceWeights', this.createSourceWeights());
    this.sourceWeights = this.form.get('sourceWeights') as FormArray;
    console.log('ngOnInit this.sourceWeights', this.sourceWeights);
  }

  createSourceWeights() {
    if (!this.data.strategy || !this.data.strategy.sourceWeights) {
      return this.fb.array([this.createSourceWeight('', '')]);
    }
    const result = [];
    this.data.strategy.sourceWeights.forEach(sw => {
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
    return this.data.strategy ? 'Edit Merge Strategy' : 'New Merge Strategy';
  }

  getSubmitButtonTitle() {
    return this.data.strategy ? 'SAVE' : 'CREATE';
  }

  onSave() {
    const resultStrategy = new MergeStrategy(this.form.value);
    // TODO allow custom strategies
    resultStrategy.algorithmRef = 'standard';
    if (this.form.value.length) {
      resultStrategy.length = { weight: this.form.value.length };
    }
    resultStrategy.sourceWeights = this.getValidSourceWeights(this.form.value.sourceWeights);
    console.log('onSave resultStrategy', resultStrategy);
    this.dialogRef.close({str: resultStrategy, index: this.form.value.index});
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
