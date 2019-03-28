import { Merging } from "./merging.model";

/**
 * Represents a set of merge options for UI display.
 */
export class MergeOptions {
  public options: Array<MergeOption> = [];

  /**
   * Construct merge options based on a JSON merging configuration.
   */
  static fromMerging(merging: Merging) {
    const result = new MergeOptions();
    const algs = merging.algorithms['custom'];
    const strategies = merging.mergeStrategies;
    if (merging.merging) {
      merging.merging.forEach(mOpt => {
        // Do not add default to options (add to strategies)
        if (!mOpt.default) {
          result.options.push(MergeOption.fromMerging(mOpt, algs, strategies));
        }
      })
    }
    return result;
  }

  /**
   * Add a new merge option to the set.
   */
  addOption(opt) {
    this.options.push(new MergeOption(opt));
  }

  /**
   * Update a merge option in the set.
   */
  updateOption(opt, index) {
    let mOpt = new MergeOption(opt);
    this.options.splice(index, 1, mOpt);
  }

  /**
   * Update merge options based on a strategy.
   */
  updateOptionsByStrategy(str) {
    this.options.forEach((mOpt, i) => {
      if (str.name === mOpt.strategy) {
        this.options[i].maxValues = str.maxValues;
        this.options[i].maxSources = str.maxSources;
        this.options[i].sourceWeights = str.sourceWeights;
        this.options[i].length = str.length;
      }
    })
  }

  /**
   * Delete a merge option from the set.
   */
  deleteOption(opt) {
    let i = this.options.findIndex(o => {
      return o === opt;
    })
    if (i >= 0) {
      this.options.splice(i, 1);
    }
  }

  /**
   * Update merge options based on a strategy.
   */
  deleteOptionsByStrategy(str) {
    this.options.forEach((mOpt, i) => {
      if (str.name === mOpt.strategy) {
        this.options.splice(i, 1);
      }
    })
  }

}

/**
 * Represents a merge option for UI display.
 */
export class MergeOption {
  public propertyName: Array<string>;
  public algorithmRef: string;
  public maxValues: number;
  public maxSources: number;
  public sourceWeights: Array<any> = [];
  public length: Object;
  public strategy: string;
  public customUri: string;
  public customFunction: string;
  public customNs: string;
  public mergeType: string;
  public editing: string = '';

  constructor (mOpt: any = {}) {
    if (mOpt.propertyName) this.propertyName = mOpt.propertyName;
    if (mOpt.algorithmRef) this.algorithmRef = mOpt.algorithmRef;
    if (mOpt.maxValues) this.maxValues = mOpt.maxValues;
    if (mOpt.maxSources) this.maxSources = mOpt.maxSources;
    if (mOpt.sourceWeights) this.sourceWeights = mOpt.sourceWeights;
    if (mOpt.length) this.length = mOpt.length;
    if (mOpt.strategy) this.strategy = mOpt.strategy;
    if (mOpt.customUri) this.customUri = mOpt.customUri;
    if (mOpt.customFunction) this.customFunction = mOpt.customFunction;
    if (mOpt.customNs) this.customNs = mOpt.customNs;
    if (mOpt.mergeType) this.mergeType = mOpt.mergeType;
  }

  /**
   * Construct a merge option from merging configuration data.
   */
  static fromMerging(mOpt: any, algs: any, strategies: any) {
    let result;
    if (mOpt.strategy !== undefined) {
      // Handle strategy type
      let strategy = strategies.find(s => {
        return s.name === mOpt.strategy;
      });
      result = new MergeOption(strategy);
      result.propertyName = mOpt.propertyName;
      result.strategy = mOpt.strategy;
      result.mergeType = 'strategy';
    } else if (mOpt.algorithmRef !== undefined) {
      // Handle custom type
      result = new MergeOption(mOpt);
      let alg = algs.find(a => {
        return a.name === mOpt.algorithmRef;
      });
      if (alg.at) result.customUri = alg.at;
      if (alg.function) result.customFunction = alg.function;
      if (alg.namespace) result.customNs = alg.namespace;
      result.mergeType = 'custom';
    } else {
      // Handle standard type
      result = new MergeOption(mOpt);
      result.mergeType = 'standard';
    }
    return result;
  }

}
