import { Injectable, EventEmitter } from '@angular/core';
import { Message } from 'stompjs/lib/stomp.min';
import { STOMPService } from '../stomp';
import { FlowStatus } from '../entities/flow-status.model';

@Injectable()
export class JobListenerService {

  public jobStarted: EventEmitter<any> = new EventEmitter();
  public jobFinished: EventEmitter<any> = new EventEmitter();

  private runningJobs: Map<string, FlowStatus> = new Map<string, FlowStatus>();
  private jobOutputs: Map<string, Array<string>> = new Map<string, Array<string>>();

  constructor(private stomp: STOMPService) {
    this.stomp.messages.subscribe(this.onWebsockMessage);
    this.stomp.subscribe('/topic/flow-status');
  }

  public runningJobCount(): number {
    return this.runningJobs.size;
  }

  public totalPercentComplete(): number {
    const total = this.runningJobCount();
    let pc = 0;
    this.runningJobs.forEach((value, key) => {
      pc += value.percentComplete;
    });
    return Math.floor(pc / total);
  }

  public jobHasOutput(jobId: string): boolean {
    return this.jobOutputs.has(jobId);
  }

  public getJobOutput(jobId: string): string {
    return this.jobOutputs.get(jobId).join('\n');
  }

  private onWebsockMessage = (message: Message) => {
    if (message.headers.destination === '/topic/flow-status') {
      let status: FlowStatus = JSON.parse(message.body);
      const running: boolean = status.percentComplete !== 100;

      // either add or remove to list of running flows
      if (running) {
        // a job may have started
        if (!this.runningJobs.has(status.jobId)) {
          this.jobStarted.next(status.jobId);
        }

        this.runningJobs.set(status.jobId, status);

        if (status.message && status.message !== '') {
          // initialize the array if it doesn't exist
          if (!this.jobOutputs.has(status.jobId)) {
            this.jobOutputs.set(status.jobId, new Array<string>());
          }
          let arr: Array<string> = this.jobOutputs.get(status.jobId);
          arr.push(status.message);
        }
      } else {
        // a job finished
        this.jobFinished.emit(status.jobId);

        if (this.runningJobs.has(status.jobId)) {
          this.runningJobs.delete(status.jobId);
        }

        if (this.jobOutputs.has(status.jobId)) {
          this.jobOutputs.delete(status.jobId);
        }
      }
    }
  }
}
