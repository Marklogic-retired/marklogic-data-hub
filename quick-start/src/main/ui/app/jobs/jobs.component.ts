import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobOutputComponent } from './job-output.component';
import { Job } from './job.model';
import { JobService } from './jobs.service';
import { JobListenerService } from './job-listener.service';
import { SearchResponse } from '../search';
import { MdlDialogService, MdlDialogReference } from '@angular-mdl/core';
import { differenceInSeconds } from 'date-fns';

import * as _ from 'lodash';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
})
export class JobsComponent implements OnChanges, OnDestroy, OnInit {

  private sub: any;
  searchText: string = null;
  activeFacets: any = {};
  currentPage: number = 1;
  pageLength: number = 10;
  loadingJobs: boolean = false;
  searchResponse: SearchResponse;
  jobs: Array<Job>;
  jobsToDelete: string[] = [];
  runningFlows: Map<number, string> = new Map<number, string>();
  facetNames: Array<string> = ['entityName', 'status', 'flowName', 'flowType'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private jobListener: JobListenerService,
    private dialogService: MdlDialogService
  ) {
    this.jobListener.jobStarted.subscribe(this.jobStarted);
    this.jobListener.jobFinished.subscribe(this.jobFinished);
  }

  ngOnInit() {
    this.sub = this.route.queryParams.subscribe(params => {
      this.searchText = params['q'];
      this.currentPage = params['p'] ? parseInt(params['p']) : this.currentPage;
      this.pageLength = params['pl'] || this.pageLength;

      for (let facet of this.facetNames) {
        if (params[facet]) {
          this.activeFacets[facet] = {
            values: [params[facet]]
          };
        }
      }
      this.getJobs();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  ngOnChanges(changes: any) {
    if (changes.activeFacets && changes.activeFacets.currentValue) {
    }
  }
  pageChanged(page: number) {
    this.currentPage = page;
    this.runQuery();
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

  public doSearch(): void {
    this.currentPage = 1;
    this.runQuery();
  }

  private runQuery(): void {
    let params = {
      p: this.currentPage
    };
    if (this.searchText) {
      params['q'] = this.searchText;
    }

    Object.keys(this.activeFacets).forEach((key) => {
      if (this.activeFacets[key] && this.activeFacets[key].values && this.activeFacets[key].values.length > 0) {
        params[key] = this.activeFacets[key].values[0];
      }
    });

    this.router.navigate(['/jobs'], {
      queryParams: params
    }).then((value: boolean) => {
      if (value !== true) {
        this.getJobs();
      }
    });
  }

  private getJobs(): void {
    this.loadingJobs = true;
    this.jobService.getJobs(
      this.searchText,
      this.activeFacets,
      this.currentPage,
      this.pageLength
    ).subscribe(response => {
      this.jobsToDelete.length = 0;
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
    return differenceInSeconds(job.endTime, job.startTime);
  }

  showConsole(job: Job): void {
    this.dialogService.showCustomDialog({
      component: JobOutputComponent,
      providers: [
        { provide: 'job', useValue: job },
        { provide: 'jobs', useValue: this.jobs }
      ],
      isModal: true
    });
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
    if (flowType === 'harmonize') {
      return 'mdi-looks';
    } else if (flowType === 'input') {
      return 'mdi-import';
    }
    return '';
  }

  updateFacets() {
    this.doSearch();
  }

  showTraces(jobId: string) {
    this.router.navigate(['/traces'], {
      queryParams: {
        jobId: jobId
      }
    });
  }

  toggleDeleteJob(jobId) {
    let index = this.jobsToDelete.indexOf(jobId);
    if (index > -1) {
      this.jobsToDelete.splice(index, 1);
    } else {
      this.jobsToDelete.push(jobId);
    }
  }

  deleteJobs() {
    if (this.jobsToDelete.length > 0) {
      const message = 'Delete ' + this.jobsToDelete.length + ' jobs and their traces?';
      this.dialogService.confirm(message, 'Cancel', 'Delete').subscribe(() => {
        this.jobService.deleteJobs(this.jobsToDelete)
          .subscribe(response => {
              this.getJobs();
            },
            () => {
              this.dialogService.alert("Failed to delete jobs");
            });
      },
      () => {});
    }
  }

  render(o) {
    return JSON.stringify(o);
  }
}
