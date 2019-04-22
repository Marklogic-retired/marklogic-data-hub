import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatchOption } from "../match-options.model";
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from "@angular/forms";
import { WeightValidator } from '../../../../validators/weight.validator';
import { AddMatchOptionValidator } from '../../../../validators/add-match-option.validator';
import { forOwn } from 'lodash';

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

  form: FormGroup;
  props: FormArray;
  selectedType: string;
  propertiesReduce: FormArray;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddMatchOptionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      propertyName: [this.data.option ? this.data.option.propertyName[0] : ''],
      matchType: [this.data.option ? this.data.option.matchType : 'exact'],
      weight: [this.data.option ? this.data.option.weight : '',
        [Validators.required, WeightValidator]],
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
