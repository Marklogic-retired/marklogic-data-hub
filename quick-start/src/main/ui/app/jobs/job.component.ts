import { Component, OnChanges } from '@angular/core';
import { Job } from './job.model';
import { JobService } from './jobs.service';
import { JobListenerService } from './job-listener.service';
import { SearchResponse } from '../search';

import * as moment from 'moment';

import * as _ from 'lodash';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.tpl.html',
  styleUrls: ['./jobs.style.scss'],
})
export class JobsComponent implements OnChanges {

  searchText: string = null;
  activeFacets: any = {};
  currentPage: number = 1;
  pageLength: number = 10;
  loadingJobs: boolean = false;
  searchResponse: SearchResponse;
  jobs: Array<Job>;
  showJobOutput: Job;
  runningFlows: Map<number, string> = new Map<number, string>();

  constructor(private jobService: JobService, private jobListener: JobListenerService) {
    this.getJobs();

    this.jobListener.jobStarted.subscribe(this.jobStarted);
    this.jobListener.jobFinished.subscribe(this.jobFinished);
  }

  ngOnChanges(changes: any) {
    console.log('ngOnChanges: ' + JSON.stringify(changes));
    if (changes.activeFacets && changes.activeFacets.currentValue) {
      console.log(this.activeFacets);
    }
  }
  pageChanged(page: number) {
    this.currentPage = page;
    this.getJobs();
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
    this.jobService.getJobs(
      this.searchText,
      this.activeFacets,
      this.currentPage,
      this.pageLength
    ).subscribe(response => {
      this.searchResponse = response;
      this.jobs = _.map(response.results, (result: any) => {
        return result.content;
      });
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

  updateFacets() {
    this.getJobs();
  }

  render(o) {
    return JSON.stringify(o);
  }
}
