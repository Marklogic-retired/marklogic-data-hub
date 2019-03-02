import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Component, Inject, OnInit} from "@angular/core";
import {Flow} from "../../models/flow.model";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CustomFieldValidator} from "../../../common/form-validators/custom-field-validator";

@Component({
  selector: 'new-flow-dialog',
  templateUrl: 'flow-settings-dialog.component.html',
  styleUrls: ['flow-settings-dialog.component.scss']
})
export class FlowSettingsDialogComponent implements OnInit{

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<FlowSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { flow: Flow }) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      name: [this.data.flow ? this.data.flow.name : '', Validators.required],
      description: [this.data.flow ? this.data.flow.description : ''],
      batchSize: [this.data.flow ? this.data.flow.batchSize : 100, CustomFieldValidator.number({min: 1})],
      threadCount: [this.data.flow ? this.data.flow.threadCount : 4, CustomFieldValidator.number({min: 1})]
    })
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  getDialogTitle(){
    return this.data.flow ? 'Flow Settings' : 'New Flow';
  }

  getSubmitButtonTitle() {
    return this.data.flow ? 'Save' : 'Create';
  }

  onSave() {
    const resultFlow = this.data.flow ? this.data.flow.toJson() : new Flow().toJson();
    resultFlow.name = this.form.value.name;
    resultFlow.description = this.form.value.description;
    resultFlow.batchSize = this.form.value.batchSize;
    resultFlow.threadCount = this.form.value.threadCount;
    this.dialogRef.close(resultFlow);
  }
}
