import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Component, Inject, OnInit} from "@angular/core";
import {Flow} from "../../models/flow.model";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {CustomFieldValidator} from "../../../common";
import {forEach, forOwn, find} from 'lodash';

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
    @Inject(MAT_DIALOG_DATA) public data: { flow: Flow, flowNames: string[], isUpdate: boolean }) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      name: [this.data.flow ? this.data.flow.name : '', [
        Validators.required,
        Validators.pattern('[a-zA-Z][a-zA-Z0-9\_\-]*'),
        (control: FormControl): { [key: string]: any } | null => {
          const forbiddenName = find(this.data.flowNames, name => (name === control.value && (this.data.flow ? this.data.flow.name !== name : true)));
          return forbiddenName ? {'forbiddenName': {value: control.value}} : null;
        }
      ]],
      description: [this.data.flow ? this.data.flow.description || '' : ''],
      batchSize: [this.data.flow ? this.data.flow.batchSize || 100 : 100, CustomFieldValidator.number({min: 1})],
      threadCount: [this.data.flow ? this.data.flow.threadCount || 4 : 4, CustomFieldValidator.number({min: 1})]
    });
    if (this.data.isUpdate ) {
      this.form.controls['name'].disable();
    }
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
    return this.data.flow ? 'SAVE' : 'CREATE';
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
    if ( this.data.flow && this.data.flow.name ) {
      resultFlow.name = this.form.getRawValue().name;
    } else {
      resultFlow.name = this.form.value.name;
    }
    resultFlow.description = this.form.value.description;
    resultFlow.batchSize = parseInt(this.form.value.batchSize);
    resultFlow.threadCount = parseInt(this.form.value.threadCount);
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

  getNameErrorMessage() {
    const errorCodes = [
      {code: 'required', message: 'You must enter a value.'},
      {code: 'pattern', message: 'Only letters, numbers, \"_\" and \"-\" allowed and must start with a letter.'},
      {code: 'forbiddenName', message: 'This flow name already exists.'}
    ];
    const nameCtrl = this.form.get('name');
    if (!nameCtrl) {
      return ''
    }
    const err = errorCodes.find( err => nameCtrl.hasError(err.code));
    return err ? err.message : '';
  }
}
