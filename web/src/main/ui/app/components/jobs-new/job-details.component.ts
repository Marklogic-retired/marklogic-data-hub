import { Component, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import { ManageJobsService } from "./manage-jobs.service";
import { JobDetailsUiComponent } from "./ui/job-details-ui.component";
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
export class JobDetailsComponent {

  @ViewChild(JobDetailsUiComponent)
  jobDetailsPageUi: JobDetailsUiComponent;

  jobId: string;
  job: any;

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
    // if (this.jobId) {
    //   this.manageJobsService.getJobById(this.jobId).subscribe( resp => {
    //     console.log('job by id response', resp);
    //     this.job = Job.fromJSON(resp);
    //   });
    // }
    this.job = this.manageJobsService.getJobById(this.jobId);
    console.log('this.job', this.job);
  }
}
