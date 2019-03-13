import {Component, Inject, OnInit, AfterViewChecked } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatCheckboxChange } from '@angular/material';
import { EditFlowUiComponent } from './edit-flow-ui.component';

export interface RunDialogData {
  steps: any;
}

@Component({
  selector: 'app-run-flow-dialog',
  templateUrl: './run-flow-dialog.component.html',
  styleUrls: ['./run-flow-dialog.component.scss'],
})
export class RunFlowDialogComponent implements OnInit {
  selected = [];
  indeterminate = false;
  runAll = true;
  constructor(
    public dialogRef: MatDialogRef<EditFlowUiComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RunDialogData) {}

  ngOnInit() {
    this.data.steps.forEach( step => {
      this.selected.push(true);
    });
  }
  isCheckAll(): boolean {
    if (this.selected.every(this.allSelected)) {
      return this.runAll = true;
    } else {
      return this.runAll = false;
    }
  }
  allSelected(currentValue) {
    return currentValue === true;
  }
  allNotSelected(currentValue) {
    return currentValue === false;
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  toggleSelection(change: MatCheckboxChange): void {
    if (change.checked) {
      this.selected = this.selected.map(runOption => true);
      this.runAll = true;
    } else {
      this.selected = this.selected.map(runOption => false);
      this.runAll = false;
      this.indeterminate = false;
    }
  }
  checkSelections(change: MatCheckboxChange, index) {
    this.selected[index] = change.checked;
    if (this.selected.every(this.allSelected)) {
      this.runAll = true;
      this.indeterminate = false;
    } else if (this.selected.every(this.allNotSelected)) {
      this.runAll = false;
      this.indeterminate = false;
    } else {
      this.runAll = false;
      this.indeterminate = true;
    }
  }
  returnSelectedSteps() {
    const selectedSteps = this.data.steps.map((selected, index) => {
      if (this.selected[index]) {
        return selected;
      }
    });
    return selectedSteps.filter(selected => selected);
  }
}
