import { MasteringOptions } from './mastering-options.model';

export class MatchingOptions extends MasteringOptions {
  constructor() {
    super();
    // Matching does not include Merging options
    delete this.mergeOptions;
  }
}
