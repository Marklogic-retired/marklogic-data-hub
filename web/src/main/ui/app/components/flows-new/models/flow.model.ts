import { isNumber } from "util";
import {Job} from "../../jobs/job.model";

export class Flow {

  public flowId: string;
  public name: string = '';
  public description: string;
  public batchSize: number;
  public threadCount: number;
  public options: Object = {};
  public steps: Array<any> = [];
  public jobs: Array<string> = [];
  public latestJob: any = {};
  public isValid: boolean = false;
  public isRunning: boolean = false;
  public version: string;

  get docsCommitted(): number{
    return this.latestJob.successfulEvents;
  }

  get docsFailed(): number{
    return this.latestJob.failedEvents;
  }

  constructor() {}

  get status(): string {
    return (this.latestJob && this.latestJob['status']) ? this.latestJob['status'] : 'Never Run';
  }

  get jobsNumber(): number {
    return this.jobs? this.jobs.length : 0;
  }

  get lastJobFinished() {
    return this.latestJob.endTime;
  }

  get targetEntity(): string {
    let step = this.steps.find(function(step) {
      return step.config['targetEntity'] !== undefined && step.config['targetEntity'] !== '';
    })
    return (step) ? step.config['targetEntity'] : '';
  }

  static fromJSON(json) {

    const result = new Flow();

    if(json.id) {
      result.flowId = json.id;
    }
    if(json.name) {
      result.name = json.name;
    }
    if(json.description) {
      result.description = json.description;
    }
    if(json.batchSize && isNumber(parseInt(json.batchSize))){
      result.batchSize = json.batchSize;
    }
    if(json.threadCount && isNumber(parseInt(json.threadCount))){
      result.threadCount = json.threadCount;
    }
    if(json.options) {
      result.options = json.options;
    }
    if(json.steps) {
      result.steps = json.steps;
    }
    if(json.jobs) {
      result.jobs = json.jobs;
    }
    if(json.latestJob) {
      result.latestJob = json.latestJob;
    }
    if(json.isValid){
      result.isValid = json.isValid;
    }
    if(json.isRunning) {
      result.isRunning = json.isRunning;
    }
    if(json.version && isNumber(parseInt(json.version))){
      result.version = json.version;
    }
    return result;
  }

}
