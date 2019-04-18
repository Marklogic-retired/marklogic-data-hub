import { Matching } from '../edit-flow/mastering/matching/matching.model';
import { Merging } from '../edit-flow/mastering/merging/merging.model';

export class MasteringOptions {
  public sourceQuery: string = '';
  public sourceCollection: string = '';
  public sourceDatabase: string = '';
  public targetDatabase: string;
  public matchOptions: Matching;
  public mergeOptions: Merging;
  constructor() {
    this.matchOptions = new Matching;
    this.mergeOptions = new Merging;
  }
}
