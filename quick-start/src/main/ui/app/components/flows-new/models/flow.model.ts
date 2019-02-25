import {Step} from "./step.model";
import {Job} from "../../jobs/job.model";
import { isNumber } from "util";

export class Flow {

  public flowId: string;
  public name: string;
  public description: string;
  public batchSize: number;
  public threadCount: number;
  public options: Object = {};
  public steps: Array<any> = [];
  public jobs: Array<string> = [];
  public latestJob: Object = {};
  public isValid: boolean = false;
  public isRunning: boolean = false;
  public version: string;


  constructor() {}

  get status(): string {
    return this.latestJob['status'];
  }

  get targetEntity(): string {
    // TODO return target entity associated with
    // mapping if it exists
    return '';
  }

  fromJSON(json) {
    if(json.id) {
      this.flowId = json.id;
    }
    if(json.name) {
      this.name = json.name;
    }
    if(json.description) {
      this.description = json.description;
    }
    if(json.batchSize && isNumber(parseInt(json.batchSize))){
      this.batchSize = json.batchSize;
    }
    if(json.threadCount && isNumber(parseInt(json.threadCount))){
      this.threadCount = json.threadCount;
    }
    if(json.options) {
      this.options = json.options;
    }
    if(json.steps) {
      this.steps = json.steps;
    }
    if(json.jobs) {
      this.jobs = json.jobs;
    }
    if(json.latestJob) {
      this.latestJob = json.latestJob;
    }
    if(json.isValid){
      this.isValid = json.isValid;
    }
    if(json.isRunning) {
      this.isRunning = json.isRunning;
    }
    if(json.version && isNumber(parseInt(json.version))){
      this.version = json.version;
    }
    return this;
  }

}
