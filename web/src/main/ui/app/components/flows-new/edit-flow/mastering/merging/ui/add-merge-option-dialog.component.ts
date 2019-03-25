import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MergeOption } from "../merge-options.model";
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from "@angular/forms";
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
  sourceWeights: FormArray;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddMergeOptionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    console.log('this.data.option', this.data.option);
    this.form = this.fb.group({
      propertyName: [this.data.option ? this.data.option.propertyName : ''],
      mergeType: [this.data.option ? this.data.option.mergeType : 'exact'],
      algorithmRef: [this.data.option ? this.data.option.algorithmRef : ''],
      maxValues: [this.data.option ? this.data.option.maxValues : ''],
      maxSources: [this.data.option ? this.data.option.maxSources : ''],
      //sourceWeights: [this.data.option ? this.data.option.sourceWeights : []],
      length: [(this.data.option && this.data.option.length) ? this.data.option.length.weight : ''],
      strategy: [this.data.option ? this.data.option.strategy : ''],
      customUri: [this.data.option ? this.data.option.customUri : ''],
      customFunction: [this.data.option ? this.data.option.customFunction : ''],
      index: this.data.index,
      entityProps:  [this.data.entityProps ? this.data.entityProps : []]
    })
    this.selectedType = (this.data.option && this.data.option.mergeType) ?
      this.data.option.mergeType : 'standard';
    this.form.setControl('sourceWeights', this.createSourceWeights());
    this.sourceWeights = this.form.get('sourceWeights') as FormArray;
    console.log('ngOnInit this.form', this.form);
    console.log('ngOnInit this.sourceWeights', this.sourceWeights);
  }

        // "sourceWeights": [
        // {
        //   "source": {
        //     "name": "CRM",
        //     "weight": "3"
        //   }
        // },

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
    return this.data.option ? 'Edit Merge Option' : 'New Merge Option';
  }

  getSubmitButtonTitle() {
    return this.data.option ? 'Save' : 'Create';
  }

  onSave() {
    const resultOption = new MergeOption(this.form.value);
    if (this.form.value.length) {
      resultOption.length = { weight: this.form.value.length };
    }
    this.dialogRef.close({opt: resultOption, index: this.form.value.index});
  }

}
