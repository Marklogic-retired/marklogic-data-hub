import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Component, Inject, OnInit} from "@angular/core";

export interface DialogData {
  output: string;
}

@Component({
  selector: 'output-dialog',
  templateUrl: 'output-dialog.component.html',
  styleUrls: ['output-dialog.component.scss']
})
export class OutputDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<OutputDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
  }

  ngOnInit() {

  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

}
