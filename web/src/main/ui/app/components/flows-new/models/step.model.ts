import { Matching } from '../edit-flow/mastering/matching/matching.model';
import {Ingestion} from "../edit-flow/ingest/model/ingest.model";

export class Step {
  public id: string;
  public type: string;
  public name: string = '';
  public description: string = '';
  public sourceDatabase: string = '';
  public targetDatabase: string;
  public config: {
    matchOptions:  Matching;
    // TODO add merge options
    // mergeOptions:
  } | Ingestion;
  public language: string;
  public isValid: boolean = false;
  public isRunning: boolean = false;
  public version: string;

  // Mapping
  public sourceCollection: string;
  public sourceQuery: string = '';
  public targetEntity: string;

  // Custom
  public customModuleUri: string = '';

}
