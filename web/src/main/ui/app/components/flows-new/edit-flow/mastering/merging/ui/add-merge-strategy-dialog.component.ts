import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MergeStrategy } from "../merge-strategies.model";
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from "@angular/forms";
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
  selectedType: string;
  sourceWeights: FormArray;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddMergeStrategyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    console.log('this.data.strategy', this.data.strategy);
    this.form = this.fb.group({
      name: [this.data.strategy ? this.data.strategy.name : ''],
      algorithmRef: [this.data.strategy ? this.data.strategy.algorithmRef : ''],
      maxValues: [this.data.strategy ? this.data.strategy.maxValues : ''],
      maxSources: [this.data.strategy ? this.data.strategy.maxSources : ''],
      length: [(this.data.strategy && this.data.strategy.length) ? this.data.strategy.length.weight : ''],
      customUri: [this.data.strategy ? this.data.strategy.customUri : ''],
      customFunction: [this.data.strategy ? this.data.strategy.customFunction : ''],
      index: this.data.index
    })
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
    });
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
    return this.data.strategy ? 'Save' : 'Create';
  }

  onSave() {
    const resultStrategy = new MergeStrategy(this.form.value);
    // TODO allow custom strategies
    resultStrategy.algorithmRef = 'standard';
    if (this.form.value.length) {
      resultStrategy.length = { weight: this.form.value.length };
    }
    console.log('onSave resultStrategy', resultStrategy);
    this.dialogRef.close({str: resultStrategy, index: this.form.value.index});
  }

}
