import { Matching } from '../edit-flow/mastering/matching/matching.model';
import { Merging } from '../edit-flow/mastering/merging/merging.model';

export class MasteringOptions {
  constructor() {
    this.matchOptions = new Matching;
    this.mergeOptions = new Merging;
}
  public sourceQuery: string = '';
  public targetEntity: string = '';
  public matchOptions: Matching;
  public mergeOptions: Merging;
}