import { Component, HostListener, Inject } from '@angular/core';

import { Job } from './job.model';

import { MdlDialogReference } from '@angular-mdl/core';

import { JobListenerService } from './job-listener.service';

import * as _ from 'lodash';

@Component({
  selector: 'app-job-output',
  template: `
  <app-job-output-ui     
    [job]="job"
    [jobOutput]="jobOutput"
    (cancelClicked)="cancel()"
  ></app-job-output-ui>
  `
})
export class JobOutputComponent {
  job: Job;
  jobs: Array<Job>;
  jobOutput: Array<String>;

  constructor(
    private dialog: MdlDialogReference,
    private jobListener: JobListenerService,
    @Inject('job') job: Job,
    @Inject('jobs') jobs: Array<Job>
  ) {
    this.job = job;
    this.jobs = jobs;
    this.jobOutput = this.getJobOutput(this.job);
  }

  hide() {
    this.dialog.hide();
  }

  @HostListener('keydown.esc')
  public onEsc(): void {
    this.cancel();
  }

  cancel() {
    this.hide();
  }

  private hasLiveOutput(job: Job): boolean {
    return this.jobListener.jobHasOutput(job.jobId);
  }

  private formatJobOutput(jobOutput): Array<String> {
    let arr = _.map(jobOutput, (output) => {
      return output.replace(/\\n/g, '\n').replace(/\\/g, '');
    })
    return arr;
  }

  getJobOutput(job: Job): Array<String> {
    let output: String;
    if (job.jobOutput) {
      output = job.jobOutput;
    } else if (this.hasLiveOutput(job)) {
      output = this.jobListener.getJobOutput(job.jobId);
    } else {
      let j: Job = _.find(this.jobs, ['jobId', job.jobId]);
      if (j) {
        output =  j.jobOutput;
      }
    }
    return this.formatJobOutput(output);
  }
}
