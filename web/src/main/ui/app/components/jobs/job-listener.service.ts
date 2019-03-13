import { Injectable, EventEmitter } from '@angular/core';
import { Message } from 'stompjs/lib/stomp.min';
import { STOMPService } from '../../services/stomp';
import { FlowStatus } from '../../models/flow-status.model';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable()
export class JobListenerService {

  public jobStarted: EventEmitter<any> = new EventEmitter();
  public jobFinished: EventEmitter<any> = new EventEmitter();
  public jobsRunning: BehaviorSubject<number>;
  public percentage: BehaviorSubject<number>;

  private runningJobs: Map<string, FlowStatus> = new Map<string, FlowStatus>();
  private jobOutputs: Map<string, Array<string>> = new Map<string, Array<string>>();

  constructor(private stomp: STOMPService) {
    this.stomp.messages.subscribe(this.onWebsockMessage);
    this.stomp.subscribe('/topic/flow-status');
    this.jobsRunning = new BehaviorSubject<number>(0);
    this.percentage = new BehaviorSubject<number>(0);
  }

  public runningJobCount(): Observable<number>  {
    return this.jobsRunning.asObservable();
  }

  public totalPercentComplete(): Observable<number> {
    return this.percentage.asObservable();
  }

  public setJobsRunning(newValue: number): void {
    this.jobsRunning.next(newValue);
  }

  public setPercentage(): void {
    const total = this.runningJobs.size;
    let pc = 0;
    this.runningJobs.forEach((value, key) => {
      pc += value.percentComplete;
    });
    this.percentage.next(Math.floor(pc / total));
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
        this.setJobsRunning(this.runningJobs.size);
        this.setPercentage();
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
        this.setJobsRunning(this.runningJobs.size);
        this.setPercentage();
      }
    }
  }
}
