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
  propertiesReduce: FormArray;

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
      sourceWeights: [this.data.option ? this.data.option.sourceWeights : []],
      length: [(this.data.option && this.data.option.length) ? this.data.option.length.weight : ''],
      strategy: [this.data.option ? this.data.option.strategy : ''],
      customUri: [this.data.option ? this.data.option.customUri : ''],
      customFunction: [this.data.option ? this.data.option.customFunction : ''],
      index: this.data.index,
      entityProps:  [this.data.entityProps ? this.data.entityProps : []]
    })
    this.selectedType = (this.data.option && this.data.option.mergeType) ?
      this.data.option.mergeType : 'standard';
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
