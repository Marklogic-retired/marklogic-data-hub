import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatchingUiComponent } from './matching-ui.component';
import { MatchThreshold } from "../../../models/match-thresholds.model";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

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

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddMatchThresholdDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      label: [this.data.option ? this.data.option.label : '', Validators.required],
      above: [this.data.option ? this.data.option.above : ''],
      action: [this.data.option ? this.data.option.action : ''],
      index: this.data.index
    })
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  getDialogTitle(){
    return this.data.option ? 'Add Match Threshold' : 'New Match Threshold';
  }

  getSubmitButtonTitle() {
    return this.data.option ? 'Save' : 'Create';
  }

  onSave() {
    console.log('onSave', this.form);
    this.dialogRef.close(this.form.value);
  }

}
