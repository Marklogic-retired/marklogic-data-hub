import { Component, ViewChild, OnInit, OnDestroy } from "@angular/core";
import {ActivatedRoute, Router, Event as NavigationEvent, NavigationStart} from '@angular/router';
import { filter } from 'rxjs/operators';
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
      [errorResponse]="errorResponse"
    >
    </job-details-page-ui>
  `
})
export class JobDetailsComponent implements OnInit, OnDestroy {

  jobId: string;
  public job: Job;
  isLoading = true;
  errorResponse: any = {
    isError: false,
    status: '',
    statusText: ''
  };
  navigationPopState: any;
  constructor(
    private manageJobsService: ManageJobsService,
    private runningJobService: RunningJobService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.navigationPopState = router.events
    .pipe(
      filter(( event: NavigationEvent ) => {
        return( event instanceof NavigationStart );
      }
    ))
    .subscribe(( event: NavigationStart ) => {
      if (event.navigationTrigger === 'popstate') {
        this.errorResponse.isError = false;
      }
    });
  }

  ngOnInit() {
    this.getJob();
  }
  ngOnDestroy(): void {
    if (this.job) {
      this.runningJobService.stopPolling(this.jobId);
    }
    this.navigationPopState.unsubscribe();
  }
  getJob() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.jobId = params.get('jobId');
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
            console.log('job error', error);
            this.job = null;
            this.errorResponse.isError = true;
            this.errorResponse.status = error.status;
            this.errorResponse.statusText = error.statusText;
          });
      }
    });
  }
}
