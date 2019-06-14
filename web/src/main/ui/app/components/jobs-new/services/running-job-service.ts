import { Injectable } from '@angular/core';
import {timer, Subscription, Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { ManageFlowsService } from '../../flows-new/services/manage-flows.service';
import { ManageJobsService } from '../manage-jobs.service';
import { Flow } from '../../flows-new/models/flow.model';
import { Job } from '../models/job.model';


@Injectable()
export class RunningJobService {
  private subscriptions: any = {};
  private subjects: any = {};

  constructor(
    private manageFlowsService: ManageFlowsService,
    private manageJobsService: ManageJobsService
  ) {}

  stopPollingAll() {
    Object.keys(this.subscriptions).forEach(flowId => {
      this.subscriptions[flowId].unsubscribe();
    });
  }

  stopPolling(id: string) {
    if (this.subscriptions.hasOwnProperty(id)) {
      this.subscriptions[id].unsubscribe();
    }
  }

  pollFlowById(flowId: string) {
    this.subscriptions[flowId] = new Subscription();
    this.subjects[flowId] = new Subject<Flow>();

    this.subscriptions[flowId] = timer(0, 2000).pipe(
      concatMap( () => this.manageFlowsService.getFlowById(flowId))
    ).subscribe(data => {
      const flow = Flow.fromJSON(data);
      this.checkJobStatus(flow);
      this.subjects[flowId].next(flow);
    });
    return this.subjects[flowId].asObservable();
  }

  checkJobStatus(flow: Flow): boolean {
    if (this.subscriptions[flow.id] && flow.latestJob && flow.latestJob.status) {
      let runStatus = flow.latestJob.status.replace('_', ' ');
      runStatus = runStatus.replace('-', ' ');
      runStatus = runStatus.split(' ');

      if ( typeof runStatus === 'string' && runStatus === 'failed') {
        if ( this.subscriptions[flow.id]) {
          this.subscriptions[flow.id].unsubscribe();
        }
        return false;
      }

      if (runStatus[0] === 'finished' || runStatus[0] === 'canceled' || runStatus[0] === 'failed') {
        if ( this.subscriptions[flow.id]) {
          this.subscriptions[flow.id].unsubscribe();
        }
        return false;
      } else {
        return true;
      }

    } else if (this.subscriptions[flow.id] && flow.latestJob === null) {
      return true;
    } else if (this.subscriptions[flow.id] && flow.latestJob.status === null) {
      return true;
    } else {
      return false;
    }
  }

  checkJobObjectStatus(job: any): boolean {
    if ( job.status ) {
      let runStatus = job.status.replace('_', ' ');
      runStatus = runStatus.replace('-', ' ');
      runStatus = runStatus.split(' ');

      if ( typeof runStatus === 'string' && runStatus === 'failed') {
        if ( this.subscriptions[job.id]) {
          this.subscriptions[job.id].unsubscribe();
        }
        return false;
      }
      if (runStatus[0] === 'finished' || runStatus[0] === 'canceled' || runStatus[0] === 'failed') {
        if ( this.subscriptions[job.id]) {
          this.subscriptions[job.id].unsubscribe();
        }
        return false;
      } else {
        return true;
      }
    }
  }

  pollJobById(jobId: string) {
    this.subscriptions[jobId] = new Subscription();
    this.subjects[jobId] = new Subject<Job>();

    this.subscriptions[jobId] = timer(0, 2000).pipe(
      concatMap( () => this.manageJobsService.getJobById(jobId))
    ).subscribe( data => {
      const pollJob = data[0];
      this.checkJobObjectStatus(pollJob);
      this.subjects[jobId].next(pollJob);
    });
    return this.subjects[jobId].asObservable();
  }
}
