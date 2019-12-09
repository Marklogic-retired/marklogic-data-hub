import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Component, Inject} from "@angular/core";

@Component({
  selector: 'alert-dialog',
  templateUrl: 'alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss']
})
export class AlertDialogComponent{

  constructor(
    public dialogRef: MatDialogRef<AlertDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, alertMessage: string }) {
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

}
