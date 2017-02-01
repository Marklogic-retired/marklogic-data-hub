import { Component, HostListener, Inject } from '@angular/core';

import { Job } from './job.model';

import { MdlDialogReference } from 'angular2-mdl';

import { JobListenerService } from './job-listener.service';

import * as _ from 'lodash';

@Component({
  selector: 'app-job-output',
  templateUrl: './job-output.component.html',
  styleUrls: ['./job-output.component.scss']
})
export class JobOutputComponent {
  job: Job;
  jobs: Array<Job>;

  constructor(
    private dialog: MdlDialogReference,
    private jobListener: JobListenerService,
    @Inject('job') job: Job,
    @Inject('jobs') jobs: Array<Job>
  ) {
    this.job = job;
    this.jobs = jobs;
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

  getJobOutput(job: Job): string {
    if (job.jobOutput) {
      return job.jobOutput;
    } else if (this.hasLiveOutput(job)) {
      return this.jobListener.getJobOutput(job.jobId);
    } else {
      let j: Job = _.find(this.jobs, ['jobId', job.jobId]);
      if (j) {
        return j.jobOutput;
      }
    }
    return '';
  }
}
