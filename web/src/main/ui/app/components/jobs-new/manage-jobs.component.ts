import { Component, ViewChild, OnInit, OnDestroy } from "@angular/core";
import { ManageJobsService } from "./manage-jobs.service";
import { RunningJobService } from './services/running-job-service';
import { ManageJobsUiComponent } from "./ui/manage-jobs-ui.component";
import { Job } from './models/job.model';
import * as _ from "lodash";

@Component({
  selector: 'jobs-page',
  template: `
    <jobs-page-ui
      [jobs]="this.jobs"
      [isLoading]="this.isLoading"
      [errorResponse]="errorResponse"
    >
    </jobs-page-ui>
  `
})
export class ManageJobsComponent implements OnInit, OnDestroy {

  @ViewChild(ManageJobsUiComponent)
  jobsPageUi: ManageJobsUiComponent;
  isLoading = true;
  jobs = [];
  errorResponse: any = {
    isError: false,
    status: '',
    statusText: ''
  };

  constructor(
    private manageJobsService: ManageJobsService,
    private runningJobService: RunningJobService
  ) {
  }

  ngOnInit() {
    this.getJobs();
  }
  ngOnDestroy(): void {
    this.runningJobService.stopPollingAll();
  }

  getJobs() {
    this.manageJobsService.getJobs().subscribe(
      resp => {
        console.log('get jobs', resp);
        _.remove(this.jobs, () => {
          return true;
        });
      _.forEach(resp, job => {
        const jobObject = Job.fromJSON(job);
        this.jobs.push(jobObject);
        const isJobRunning = this.runningJobService.checkJobObjectStatus(job);
        if (isJobRunning) {
          this.pollJob(jobObject.id);
        }
        });
        this.isLoading = false;
        this.jobsPageUi.renderRows();
      },
      error => {
        console.log('jobs error', error);
        this.jobs = null;
        this.errorResponse.isError = true;
        this.errorResponse.status = error.status;
        this.errorResponse.statusText = error.statusText;
      });
  }

  pollJob(jobId: string) {
    this.runningJobService.pollJobById(jobId).subscribe( poll => {
      const jobIndex = this.jobs.findIndex(obj => obj.id === jobId);
      this.jobs[jobIndex] = Job.fromJSON(poll);
      this.jobsPageUi.renderRows();
    });
  }
}
