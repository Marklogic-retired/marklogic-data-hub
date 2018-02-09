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

  constructor(
    private dialog: MdlDialogReference,
    private dialogService: MdlDialogService,
    private jobService: JobService,
    @Inject('jobIds') jobIds: string[]
  ) {

    this.filename = "jobexport.zip";
    this.jobIds = jobIds;
    // register a listener if you want to be informed if the dialog is closed.
    this.dialog.onHide().subscribe( (user) => {
      console.log('job export dialog hidden');
      console.log('filename: ' + this.filename);
      if (user) {
        console.log('authenticated user', user);
      }
    });
  }

  public export() {
    console.log('export', this.dialog, this.filename);
    this.dialog.hide();
    this.jobService.exportJobs(this.filename, this.jobIds)
      .subscribe(response => {
          // announce export
          this.dialogService.alert("Exported " + response.totalJobs + " jobs");
        },
        () => {
          this.dialogService.alert("Unable to export jobs");
        });;
    // call jobService.export() here.
    // when the job succeeds or fails, pop up an alert to let the user know
  }

  @HostListener('keydown.esc')
  public onEsc(): void {
    this.dialog.hide();
  }
}
