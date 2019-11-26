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

  parsed = null;
  opened = false; // Do not show details until panel opened, avoid blink

  constructor(
    public dialogRef: MatDialogRef<StatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
  }

  ngOnInit() {
    try {
      this.parsed = JSON.parse(this.data.statusDetails);
    } catch (error) {
    }
  }

  onOpened() {
    this.opened = true;
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

}
