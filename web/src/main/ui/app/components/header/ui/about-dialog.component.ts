import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";

export interface DialogData {
  settings: any;
}

@Component({
  selector: 'about-dialog',
  templateUrl: 'about-dialog.component.html',
  styleUrls: ['about-dialog.component.scss']
})
export class AboutDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AboutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
  }

  ngOnInit() {

  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

}
