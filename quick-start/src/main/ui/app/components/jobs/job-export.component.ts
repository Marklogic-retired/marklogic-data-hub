import {Component, Inject, ViewChild} from '@angular/core';
import {JobService} from './jobs.service';
import {JobExportUiComponent} from '../index';

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
  @ViewChild(JobExportUiComponent) private exportUI: JobExportUiComponent;
  jobIds: string[];

  constructor(
    private jobService: JobService,
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
          let a = document.createElement('a');
          a.style.display = 'none';
          document.body.appendChild(a);
          let url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = 'jobexport.zip';
          a.click();
          window.URL.revokeObjectURL(url);
        },
        () => {
          this.exportUI.alert('Unable to export jobs');
        });
  }

}
