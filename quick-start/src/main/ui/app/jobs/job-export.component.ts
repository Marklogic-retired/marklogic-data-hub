import {Component, HostListener, Inject, Input} from '@angular/core';
import {MdlDialogReference, MdlDialogService} from '@angular-mdl/core';
import {JobService} from "./jobs.service";

@Component({
  selector: 'job-export-dialog',
  templateUrl: 'job-export.component.html'
})
export class JobExportDialogComponent {

  jobIds: string[];
  filename: string;
  question: string

  constructor(
    private dialog: MdlDialogReference,
    private dialogService: MdlDialogService,
    private jobService: JobService,
    @Inject('jobIds') jobIds: string[]
  ) {

    this.filename = "jobexport.zip";
    this.jobIds = jobIds;
    if (jobIds.length === 0) {
      this.question = "Export all jobs and their traces?";
    } else if (this.jobIds.length === 1) {
      this.question = "Export 1 job and its traces?";
    } else {
      this.question = "Export " + this.jobIds.length + " jobs and their traces?";
    }
  }

  public export() {
    this.dialog.hide();
    this.jobService.exportJobs(this.filename, this.jobIds)
      .subscribe(response => {
          // announce export
          let body = response['_body'];
          this.dialogService.alert("Exported " + body.totalJobs +
            (body.totalJobs === 1 ? " job" : " jobs") + " to " + body.fullPath);
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
