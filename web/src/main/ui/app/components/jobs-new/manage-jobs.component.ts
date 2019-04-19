import { Component, ViewChild, OnInit } from "@angular/core";
import { ManageJobsService } from "./manage-jobs.service";
import { ManageJobsUiComponent } from "./ui/manage-jobs-ui.component";
import { Job } from './models/job.model';
import * as _ from "lodash";

@Component({
  selector: 'jobs-page',
  template: `
    <jobs-page-ui
      [jobs]="this.jobs"
    >
    </jobs-page-ui>
  `
})
export class ManageJobsComponent implements OnInit {

  @ViewChild(ManageJobsUiComponent)
  jobsPageUi: ManageJobsUiComponent;

  jobs = [];

  constructor(
    private manageJobsService: ManageJobsService
  ) {
  }

  ngOnInit() {
    this.getJobs();
  }

  getJobs() {
    this.manageJobsService.getJobs().subscribe(resp => {
      console.log('get jobs', resp);
      _.remove(this.jobs, () => {
        return true;
      });
      _.forEach(resp, job => {
        this.jobs.push(Job.fromJSON(job));
      });
      this.jobsPageUi.renderRows();
    });

  }
}
