import { Component, ViewChild } from "@angular/core";
import { ManageJobsService } from "./manage-jobs.service";
import { ManageJobsUiComponent } from "./ui/manage-jobs-ui.component";
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
export class ManageJobsComponent {

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
    // this.manageJobsService.getJobs().subscribe(resp => {
    //   _.remove(this.jobs, () => {
    //     return true;
    //   });
    //   _.forEach(resp, job => {
    //     this.jobs.push(Job.fromJSON(job));
    //   });
    //   this.jobsPageUi.renderRows();
    // });
    this.jobs = this.manageJobsService.getJobs();
    console.log(this.jobs);
  }
}
