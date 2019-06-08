import { Matching } from '../edit-flow/mastering/matching/matching.model';
import { Merging } from '../edit-flow/mastering/merging/merging.model';

export class MasteringOptions {
  public additionalCollections: string[] = [];
  public collections: string[] = [];
  public sourceQuery: string = '';
  public sourceCollection: string = '';
  public sourceDatabase: string = '';
  public targetDatabase: string;
  public outputFormat: string;
  public matchOptions: Matching;
  public mergeOptions: Merging;
  constructor() {
    this.matchOptions = new Matching;
    this.mergeOptions = new Merging;
  }
}
