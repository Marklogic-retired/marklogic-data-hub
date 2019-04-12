import { Matching } from '../edit-flow/mastering/matching/matching.model';
import { Merging } from '../edit-flow/mastering/merging/merging.model';

export class MasteringOptions {
  private sourceQuery: string;
  private targetEntity: string;
  private matchOptions: Matching;
  private mergeOptions: Merging;
  constructor() {
    this.sourceQuery = '';
    this.targetEntity = '';
    this.matchOptions = new Matching;
    this.mergeOptions = new Merging;
  }
}
