import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MergeCollection, Event } from "../merge-collections.model";
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from "@angular/forms";
import { FlowsTooltips } from "../../../../tooltips/flows.tooltips";
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
  selectedEvent: Event;
  add: FormArray;
  remove: FormArray;
  set: FormArray;
  tooltips: any;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddMergeCollectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.tooltips = FlowsTooltips.mastering;
    this.form = this.fb.group({
      event: [this.data.collection ? this.data.collection.event : Event.ONMERGE],
      add: [this.data.collection ? this.data.collection.add : ''],
      index: this.data.index
    })
    this.form.setControl('add', this.createArray('add'));
    this.add = this.form.get('add') as FormArray;
    this.selectedEvent = (this.data.collection && this.data.collection.event) ?
      this.data.collection.event : Event.ONMERGE;
  }

  createArray(type) {
    if (!this.data.collection || !this.data.collection[type] || 
          this.data.collection[type].length === 0) {
      // Display an empty coll name field
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

  onSave() {
    // For each type: [{coll: 'foo'}] => ['foo']
    this.form.value.add = this.form.value.add.map(c => { return c.coll });
    const resultCollection = new MergeCollection(this.form.value);
    this.dialogRef.close({coll: resultCollection});
  }

}
