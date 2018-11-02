import {Component, Inject} from '@angular/core';
import {JobService} from "./jobs.service";
import {MdlDialogService} from '@angular-mdl/core';

@Component({
  selector: 'job-export-dialog',
  template: `
  <app-job-export-ui      
    [jobIds]="jobIds"
    (exportClicked)="export()"
  ></app-job-export-ui>
  `
})
export class JobExportDialogComponent {
  jobIds: string[];

  constructor(
    private jobService: JobService,
    private dialogService: MdlDialogService,
    @Inject('jobIds') jobIds: string[]
  ) {
    this.jobIds = jobIds;
  }

  public export() {
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

}
