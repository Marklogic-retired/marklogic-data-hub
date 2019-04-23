import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MergeCollection } from "../merge-collections.model";
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from "@angular/forms";
import { WeightValidator } from '../../../../validators/weight.validator';
import { forOwn } from 'lodash';

export interface DialogData {
  stepName: string;
  stepType: string;
}

@Component({
  selector: 'app-add-merge-collection-dialog',
  templateUrl: './add-merge-collection-dialog.component.html',
  styleUrls: ['./add-merge-collection-dialog.component.scss'],
})
export class AddMergeCollectionDialogComponent {

  form: FormGroup;
  props: FormArray;
  selectedEvent: string;
  add: FormArray;
  remove: FormArray;
  set: FormArray;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddMergeCollectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      event: [this.data.collection ? this.data.collection.event : 'onMerge'],
      add: [this.data.collection ? this.data.collection.add : ''],
      remove: [this.data.collection ? this.data.collection.remove : ''],
      set: [this.data.collection ? this.data.collection.set : ''],
      index: this.data.index
    })
    this.form.setControl('add', this.createArray('add'));
    this.add = this.form.get('add') as FormArray;
    this.form.setControl('remove', this.createArray('remove'));
    this.remove = this.form.get('remove') as FormArray;
    this.form.setControl('set', this.createArray('set'));
    this.set = this.form.get('set') as FormArray;
    this.selectedEvent = (this.data.collection && this.data.collection.event) ?
      this.data.collection.event : 'onMerge';
  }

  createArray(type) {
    if (!this.data.collection || !this.data.collection[type]) {
      return this.fb.array([this.createItem('')]);
    }
    const result = [];
    this.data.collection[type].forEach(coll => {
      result.push(this.createItem(coll))
    })
    return this.fb.array(result);
  }

  createItem(coll) {
    return this.fb.group({
      coll: coll
    });
  }

  onAddColl(type) {
    const array = this.form.get(type) as FormArray;
    array.push(this.createItem(''));
  }

  onRemoveColl(type, i) {
    const array = this.form.get(type) as FormArray;
    array.removeAt(i);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  getDialogTitle(){
    return this.data.collection ? 'Edit Merge Collection' : 'New Merge Collection';
  }

  getSubmitButtonTitle() {
    return this.data.collection ? 'SAVE' : 'CREATE';
  }

  onSave() {
    // For each type: [{coll: 'foo'}] => ['foo']
    this.form.value.add = this.form.value.add.map(c => { return c.coll });
    this.form.value.remove = this.form.value.remove.map(c => { return c.coll });
    this.form.value.set = this.form.value.set.map(c => { return c.coll });
    const resultCollection = new MergeCollection(this.form.value);
    this.dialogRef.close({coll: resultCollection, index: this.form.value.index});
  }

}
