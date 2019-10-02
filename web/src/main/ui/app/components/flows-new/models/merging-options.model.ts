import { MasteringOptions } from './mastering-options.model';

export class MergingOptions extends MasteringOptions {
  constructor() {
    super();
    // Merging does not include Matching options
    delete this.matchOptions;
  }
}
