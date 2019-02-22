import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Component, Inject} from "@angular/core";

@Component({
  selector: 'new-flow-dialog',
  templateUrl: 'new-flow-dialog.component.html',
  styleUrls: []
})
export class NewFlowDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<NewFlowDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { confirmationMessage: string }) {
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

}
