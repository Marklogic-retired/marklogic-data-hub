import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Component, Inject, OnInit} from "@angular/core";

export interface DialogData {
  statusDetails: string;
}

@Component({
  selector: 'status-dialog',
  templateUrl: 'status-dialog.component.html',
  styleUrls: ['status-dialog.component.scss']
})
export class StatusDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<StatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
  }

  ngOnInit() {

  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

}
