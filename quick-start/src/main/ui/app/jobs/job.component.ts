import { Component } from '@angular/core';
import { Job } from './job.model';
import { JobService } from './jobs.service';
import { JobListenerService } from './job-listener.service';

import * as moment from 'moment';

import * as _ from 'lodash';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.tpl.html',
  styleUrls: ['./jobs.style.scss'],
})
export class JobsComponent {

  loadingJobs: boolean = false;
  jobs: Array<Job>;
  showJobOutput: Job;
  runningFlows: Map<number, string> = new Map<number, string>();

  constructor(private jobService: JobService, private jobListener: JobListenerService) {
    this.getJobs();

    this.jobListener.jobStarted.subscribe(this.jobStarted);
    this.jobListener.jobFinished.subscribe(this.jobFinished);
  }

  private jobStarted = () => {
    this.getJobs();
  };

  private jobFinished = () => {
    setTimeout(() => {
      this.getJobs();
    }, 2000);
  };

  private hasLiveOutput(job: Job): boolean {
    return this.jobListener.jobHasOutput(job.jobId);
  }

  private getJobs(): void {
    this.loadingJobs = true;
    this.jobService.getJobs().subscribe(jobs => {
      this.jobs = jobs;
    },
    () => {},
    () => {
      this.loadingJobs = false;
    });
  }

  getDuration(job: Job): number {
    return moment(job.endTime).diff(moment(job.startTime), 'seconds');
  }

  showConsole(job: Job): void {
    this.showJobOutput = job;
  }

  cancelConsole(): void {
    this.showJobOutput = null;
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

  getIconClass(flowType: string) {
    if (flowType === 'Harmonize') {
      return 'mdi-looks';
    } else if (flowType === 'Input') {
      return 'mdi-import';
    }
    return '';
  }
}
