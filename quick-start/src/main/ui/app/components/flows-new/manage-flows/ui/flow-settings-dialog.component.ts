import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Component, Inject} from "@angular/core";
import {Flow} from "../../models/flow.model";

@Component({
  selector: 'new-flow-dialog',
  templateUrl: 'flow-settings-dialog.component.html',
  styleUrls: ['flow-settings-dialog.component.scss']
})
export class FlowSettingsDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<FlowSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { flow: Flow }) {
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  getDialogTitle(){
    return this.data.flow ? 'Flow Settings' : 'New Flow';
  }

}
