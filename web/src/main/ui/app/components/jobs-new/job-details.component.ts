import { Component, ViewChild, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import { ManageJobsService } from "./manage-jobs.service";
import { RunningJobService } from './services/running-job-service';
import { JobDetailsUiComponent } from "./ui/job-details-ui.component";
import { Job } from './models/job.model';
import * as _ from "lodash";

@Component({
  selector: 'job-details-page',
  template: `
    <job-details-page-ui
      [job]="this.job"
      [isLoading]="this.isLoading"
    >
    </job-details-page-ui>
  `
})
export class JobDetailsComponent implements OnInit, OnDestroy {

  jobId: string;
  public job: Job;
  isLoading = true;
  constructor(
    private manageJobsService: ManageJobsService,
    private runningJobService: RunningJobService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.getJob();
  }
  ngOnDestroy(): void {
    this.runningJobService.stopPolling(this.jobId);
  }
  getJob() {
    this.jobId = this.activatedRoute.snapshot.paramMap.get('jobId');

    // GET job by ID
    if (this.jobId) {
      this.manageJobsService.getJobById(this.jobId).subscribe(
        resp => {
          console.log('job by id response', resp);
          // Job by ID is an array with single job object
          // Update payload to be just an object?
          this.isLoading = false;
          this.job = Job.fromJSON(resp[0]);
          const isJobRunning = this.runningJobService.checkJobObjectStatus(this.job);
          if ( isJobRunning ) {
            this.runningJobService.pollJobById(this.jobId).subscribe( poll => {
              this.job = Job.fromJSON(poll);
            });
          }
        },
        error => {
          console.log('error', error);
        });
    }
  }
}
