import { Injectable } from '@angular/core';
import {timer, Subscription, Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { ManageFlowsService } from '../../flows-new/services/manage-flows.service';
import { Flow } from '../../flows-new/models/flow.model';


@Injectable()
export class RunningJobService {
  private subscriptions: any = {};
  private subjects: any = {};

  constructor(
    private manageFlowsService: ManageFlowsService
  ) {}

  stopPollingAll() {
    if (this.subscriptions) {
      Object.keys(this.subscriptions).forEach(flowId => {
        this.subscriptions[flowId].unsubscribe();
      });
    }
  }

  stopPolling(flowId: string) {
    if (this.subscriptions[flowId]) {
      this.subscriptions[flowId].unsubscribe();
    }
  }

  pollFlowById(id: string) {
    this.subscriptions[id] = new Subscription();
    this.subjects[id] = new Subject<Flow>();

    this.subscriptions[id] = timer(0, 2000).pipe(
      concatMap( () => this.manageFlowsService.getFlowById(id))
    ).subscribe(data => {
      const flow = Flow.fromJSON(data);
      this.checkJobStatus(flow);
      this.subjects[id].next(flow);
    });
    return this.subjects[id].asObservable();
  }

  checkJobStatus(flow: Flow): boolean {
    if (this.subscriptions[flow.id] && flow.latestJob && flow.latestJob.status) {
      let runStatus = flow.latestJob.status.replace('_', ' ');
      runStatus = runStatus.replace('-', ' ');
      runStatus = runStatus.split(' ');
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
    } else {
      return false;
    }
  }
}
