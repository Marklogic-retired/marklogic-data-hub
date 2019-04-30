import { Injectable } from '@angular/core';
import {timer, Subscription, Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { ManageFlowsService } from '../../flows-new/services/manage-flows.service';
import { Flow } from '../../flows-new/models/flow.model';


@Injectable()
export class RunningJobService {
  private running: Subscription;
  private flowRunning = new Subject<Flow>();

  constructor(
    private manageFlowsService: ManageFlowsService
  ) {}

  stopPolling() {
    if (this.running) {
      this.running.unsubscribe();
    }
  }

  pollFlowById(id: string) {
    this.running = timer(0, 1000).pipe(
      concatMap( () => this.manageFlowsService.getFlowById(id))
    ).subscribe(data => {
      const flow = Flow.fromJSON(data);
      this.checkJobStatus(flow);
      this.flowRunning.next(flow);
    });
    return this.flowRunning.asObservable();
  }

  checkJobStatus(flow: Flow): boolean {
    if (flow.latestJob && flow.latestJob.status) {
      let runStatus = flow.latestJob.status.replace('_', ' ');
      runStatus = runStatus.replace('-', ' ');
      runStatus = runStatus.split(' ');
      if (runStatus[0] === 'finished' || runStatus[0] === 'canceled' || runStatus[0] === 'failed') {
        if ( this.running) {
          this.running.unsubscribe();
        }
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
}
