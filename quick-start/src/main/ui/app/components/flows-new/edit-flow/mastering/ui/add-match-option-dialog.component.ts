import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatchOption } from "../../../models/match-options.model";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

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
  selectedType: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddMatchOptionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      propertyName: [this.data.option ? this.data.option.propertyName.join(', ') : ''],
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
      index: this.data.index
    })
    this.selectedType = (this.data.option && this.data.option.matchType) ?
      this.data.option.matchType : 'exact';
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  getDialogTitle(){
    return this.data.option ? 'Add Match Option' : 'New Match Option';
  }

  getSubmitButtonTitle() {
    return this.data.option ? 'Save' : 'Create';
  }

  getMatchType() {
    return (this.data.option && this.data.option.matchType) ?
      this.data.option.matchType : 'exact';
  }

  onSave() {
    console.log('onSave', this.form);
    this.dialogRef.close(this.form.value);
  }

}
