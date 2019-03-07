import {Component, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EditFlowUiComponent } from './edit-flow-ui.component';

export interface RunDialogData {
  steps: any;
}

@Component({
  selector: 'app-run-flow-dialog',
  templateUrl: './run-flow-dialog.component.html',
  styleUrls: ['./run-flow-dialog.component.scss'],
})
export class RunFlowDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<EditFlowUiComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RunDialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
