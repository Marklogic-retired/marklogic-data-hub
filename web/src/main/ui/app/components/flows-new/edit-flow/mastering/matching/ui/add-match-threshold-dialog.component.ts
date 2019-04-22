import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatchThreshold } from "../match-thresholds.model";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { WeightValidator } from '../../../../validators/weight.validator';

export interface DialogData {
  stepName: string;
  stepType: string;
}

@Component({
  selector: 'app-add-match-threshold-dialog',
  templateUrl: './add-match-threshold-dialog.component.html',
  styleUrls: ['./add-match-threshold-dialog.component.scss'],
})
export class AddMatchThresholdDialogComponent {

  form: FormGroup;
  selectedAction: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddMatchThresholdDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      label: [this.data.option ? this.data.option.label : '',
        [Validators.required]],
      above: [this.data.option ? this.data.option.above : '',
        [Validators.required, WeightValidator]],
      action: [this.data.option ? this.data.option.action : '',
        [Validators.required]],
      customUri: [this.data.option ? this.data.option.customUri : ''],
      customFunction: [this.data.option ? this.data.option.customFunction : ''],
      customNs: [this.data.option ? this.data.option.customNs : ''],
      index: this.data.index,
    })
    this.selectedAction = (this.data.option && this.data.option.action) ?
      this.data.option.action : 'merge';
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  getDialogTitle(){
    return this.data.option ? 'Edit Match Threshold' : 'New Match Threshold';
  }

  getSubmitButtonTitle() {
    return this.data.option ? 'SAVE' : 'CREATE';
  }

  onSave() {
    this.dialogRef.close(this.form.value);
  }

}
