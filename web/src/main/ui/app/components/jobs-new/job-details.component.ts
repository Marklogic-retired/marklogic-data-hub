import { Component, ViewChild, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import { ManageJobsService } from "./manage-jobs.service";
import { JobDetailsUiComponent } from "./ui/job-details-ui.component";
import { Job } from './models/job.model';
import * as _ from "lodash";

@Component({
  selector: 'job-details-page',
  template: `
    <job-details-page-ui
      [job]="this.job"
    >
    </job-details-page-ui>
  `
})
export class JobDetailsComponent implements OnInit{

  // @ViewChild(JobDetailsUiComponent)
  // jobDetailsPageUi: JobDetailsUiComponent;

  jobId: string;
  public job: Job;

  constructor(
    private manageJobsService: ManageJobsService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.getJob();
  }
  getJob() {
    this.jobId = this.activatedRoute.snapshot.paramMap.get('jobId');

    // GET job by ID
    if (this.jobId) {
      this.manageJobsService.getJobById(this.jobId).subscribe( resp => {
        console.log('job by id response', resp);
        // Job by ID is an array with single job object
        // Update payload to be just an object?
        this.job = Job.fromJSON(resp[0]);
        // this.jobDetailsPageUi.renderRows();
      });
    }
    // this.job = this.manageJobsService.getJobById(this.jobId);
    // console.log('this.job', this.job);
  }
}
