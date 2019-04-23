import {isNumber} from "util";
import uuid from "uuid";

export class Flow {

  public id: string = uuid.v4();
  public name: string = '';
  public description: string;
  public batchSize: number;
  public threadCount: number;
  public options = {};
  public steps: Array<any> = [];
  public jobs: Array<string> = [];
  public latestJob: any = null;
  public isValid: boolean = false;
  public version: number = 0;

  get recordsCommitted(): number {
    return this.latestJob.successfulEvents;
  }

  get recordsFailed(): number {
    return this.latestJob.failedEvents;
  }

  constructor() {
  }

  get status(): string {
    if (this.latestJob === null) {
      return '';
    } else {
      return (this.latestJob && this.latestJob['status']) ? this.latestJob['status'] : 'Never run';
    }
  }

  get jobsNumber(): number {
    return this.jobs ? this.jobs.length : 0;
  }

  get lastJobFinished() {
    return this.latestJob.endTime;
  }

  get targetEntity(): string {
    let step = this.steps.find(function (step) {
      return step['targetEntity'] !== undefined && step['targetEntity'] !== '' && step['targetEntity'] !== null;
    });
    return (step) ? step['targetEntity'] : '';
  }

  static fromJSON(json) {

    const result = new Flow();

    if (json.id) {
      result.id = json.id;
    }
    if (json.name) {
      result.name = json.name;
    }
    if (json.description) {
      result.description = json.description;
    }
    if (json.batchSize && isNumber(parseInt(json.batchSize))) {
      result.batchSize = json.batchSize;
    }
    if (json.threadCount && isNumber(parseInt(json.threadCount))) {
      result.threadCount = json.threadCount;
    }
    if (json.options) {
      result.options = json.options;
    }
    if (json.steps) {
      result.steps = json.steps;
    }
    if (json.jobs) {
      result.jobs = json.jobs;
    }
    if (json.latestJob) {
      result.latestJob = json.latestJob;
    }
    if (json.isValid) {
      result.isValid = json.isValid;
    }
    if (json.version && isNumber(parseInt(json.version))) {
      result.version = json.version;
    }
    return result;
  }

  toJson() {
    const result: any = {};
    result.id = this.id;
    result.name = this.name;
    result.description = this.description;
    result.batchSize = this.batchSize;
    result.threadCount = this.threadCount;
    result.options = this.options;
    result.steps = this.steps;
    result.jobs = this.jobs;
    result.latestJob = this.latestJob;
    result.isValid = this.isValid;
    result.version = this.version;
    return result;
  }

}
