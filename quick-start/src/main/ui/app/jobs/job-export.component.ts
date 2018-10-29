import {Component, HostListener, Inject, Input} from '@angular/core';
import {MdlDialogReference, MdlDialogService} from '@angular-mdl/core';
import {JobService} from "./jobs.service";

@Component({
  selector: 'job-export-dialog',
  templateUrl: 'job-export.component.html'
})
export class JobExportDialogComponent {

  jobIds: string[];
  question: string;

  constructor(
    public dialog: MdlDialogReference,
    private dialogService: MdlDialogService,
    private jobService: JobService,
    @Inject('jobIds') jobIds: string[]
  ) {

    this.jobIds = jobIds;
    this.question = "Export and download ";
    if (jobIds.length === 0) {
      this.question += "all jobs and their traces?";
    } else if (this.jobIds.length === 1) {
      this.question += "1 job and its traces?";
    } else {
      this.question += this.jobIds.length + " jobs and their traces?";
    }
  }

  public export() {
    this.dialog.hide();
    this.jobService.exportJobs(this.jobIds)
      .subscribe(response => {
          let body = response['_body'];

          // Create a download anchor tag and click it.
          var blob = new Blob([body], {type: 'application/zip'});
          let a = document.createElement("a");
          a.style.display = "none";
          document.body.appendChild(a);
          let url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = 'jobexport.zip';
          a.click();
          window.URL.revokeObjectURL(url);
        },
        () => {
          this.dialogService.alert("Unable to export jobs");
        });
  }

  @HostListener('keydown.esc')
  public onEsc(): void {
    this.dialog.hide();
  }
}
