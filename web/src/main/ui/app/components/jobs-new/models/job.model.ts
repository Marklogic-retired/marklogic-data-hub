import * as _ from "lodash";
// export enum StepType {
//   INGESTION = 'INGESTION',
//   MAPPING = 'MAPPING',
//   MASTERING = 'MASTERING',
//   CUSTOM = 'CUSTOM'
// }

export class Job {
  public id: string;
  public flowName: string;
  public flowId: string;
  public user: string;
  public status: string;
  public startTime: string;
  public endTime: string;
  public successfulEvents: number;
  public failedEvents: number;
  public lastAttemptedStep: string;
  public lastCompletedStep: string;
  public steps: Array<any> = [];

  private constructor() {}

  static fromJSON(json) {

    const result = new Job();

    if (json.id) {
      result.id = json.id;
    }
    if (json.flowName) {
      result.flowName = json.flowName;
    }
    if (json.flowId) {
      result.flowId = json.flowId;
    }
    if (json.user) {
      result.user = json.user;
    }
    if (json.status) {
      result.status = json.status;
    }
    if (json.startTime) {
      result.startTime = json.startTime;
    }
    if (json.endTime) {
      result.endTime = json.endTime;
    }
    if (!_.isUndefined(json.successfulEvents)) {
      result.successfulEvents = json.successfulEvents;
    }
    if (!_.isUndefined(json.failedEvents)) {
      result.failedEvents = json.failedEvents;
    }
    if (json.lastAttemptedStep) {
      result.lastAttemptedStep = json.lastAttemptedStep;
    }
    if (json.lastCompletedStep) {
      result.lastCompletedStep = json.lastCompletedStep;
    }
    if (json.steps) {
      result.steps = json.steps;
    }
    return result;
  }
}
