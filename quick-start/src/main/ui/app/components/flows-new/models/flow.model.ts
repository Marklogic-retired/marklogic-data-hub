import {Step} from "./step.model";
import {Job} from "../../jobs/job.model";

export class FlowModel {
  id: string;
  name: string;
  handle: string;
  description: string;
  execution: {
    batchSize: number;
    threadCount: number;
    jobs: Job[];
    traces: string[];
    lastJob: Job;
    docsCommitted: number;
    docsFailed: number;
  };
  targetEntity: string;
  steps: Step[];
}
