import {Component, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EditFlowUiComponent } from './edit-flow-ui.component';

export interface DialogData {
  stepName: string;
  stepType: string;
}

@Component({
  selector: 'app-new-step-dialog',
  templateUrl: './new-step-dialog.component.html',
  styleUrls: ['./new-step-dialog.component.scss'],
})
export class NewStepDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<EditFlowUiComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}