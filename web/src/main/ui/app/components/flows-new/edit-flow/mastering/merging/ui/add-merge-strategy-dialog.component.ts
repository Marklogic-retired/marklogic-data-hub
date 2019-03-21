import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MergeStrategy } from "../merge-strategies.model";
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from "@angular/forms";
import {forOwn} from 'lodash';

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
  propertiesReduce: FormArray;

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
      sourceWeights: [this.data.strategy ? this.data.strategy.sourceWeights : []],
      length: [(this.data.strategy && this.data.strategy.length) ? this.data.strategy.length.weight : ''],
      customUri: [this.data.strategy ? this.data.strategy.customUri : ''],
      customFunction: [this.data.strategy ? this.data.strategy.customFunction : ''],
      index: this.data.index,
      entityProps:  [this.data.entityProps ? this.data.entityProps : []]
    })
    //this.form.setControl('propertiesReduce', this.createProps());
    //this.propertiesReduce = this.form.get('propertiesReduce') as FormArray;
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
    return this.data.strategy ? 'Add Merge Strategy' : 'New Merge Strategy';
  }

  getSubmitButtonTitle() {
    return this.data.strategy ? 'Save' : 'Create';
  }

  onSave() {
    const resultStrategy = new MergeStrategy(this.form.value);
    //resultStrategy.name = resultStrategy.strategy;
    // TODO allow custom strategies
    resultStrategy.algorithmRef = 'standard';
    if (this.form.value.length) {
      resultStrategy.length = { weight: this.form.value.length };
    }
    console.log('onSave resultStrategy', resultStrategy);
    this.dialogRef.close({str: resultStrategy, index: this.form.value.index});
  }

}
