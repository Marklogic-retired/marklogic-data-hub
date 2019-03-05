import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Component, Inject, OnInit} from "@angular/core";
import {Flow} from "../../models/flow.model";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CustomFieldValidator} from "../../../common/form-validators/custom-field-validator";
import {forOwn, forEach} from 'lodash';

@Component({
  selector: 'new-flow-dialog',
  templateUrl: 'flow-settings-dialog.component.html',
  styleUrls: ['flow-settings-dialog.component.scss']
})
export class FlowSettingsDialogComponent implements OnInit {

  form: FormGroup;
  options: FormArray;

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
    });
    this.form.setControl('options', this.createOptions());
    this.options = this.form.get('options') as FormArray;
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  getDialogTitle() {
    return this.data.flow ? 'Flow Settings' : 'New Flow';
  }

  getSubmitButtonTitle() {
    return this.data.flow ? 'Save' : 'Create';
  }

  createOptions() {
    if (!this.data.flow || !this.data.flow.options) {
      return this.fb.array([this.createOption('', '')]);
    }
    const result = [];
    forOwn(this.data.flow.options, (value, key) => {
      result.push(this.createOption(key, value))
    });
    return this.fb.array(result);
  }

  createOption(key, value) {
    return this.fb.group({
      key: key,
      value: value
    });
  }

  onAddOption() {
    const options = this.form.get('options') as FormArray;
    options.push(this.createOption('', ''));
  }

  onRemoveOption(i) {
    const options = this.form.get('options') as FormArray;
    options.removeAt(i);
  }

  onSave() {
    const resultFlow = this.data.flow ? this.data.flow.toJson() : new Flow().toJson();
    resultFlow.name = this.form.value.name;
    resultFlow.description = this.form.value.description;
    resultFlow.batchSize = this.form.value.batchSize;
    resultFlow.threadCount = this.form.value.threadCount;
    resultFlow.options = this.form.value.options ?
      this.updateOptions(this.form.value.options) : [];
    this.dialogRef.close(resultFlow);
  }

  updateOptions(options: { key: string, value: string }[]) {
    const result = {};
    forEach(options, option => {
      if (option.key) {
        result[option.key] = option.value;
      }
    });
    return result;
  }
}
