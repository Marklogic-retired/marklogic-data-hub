import { Merging } from "./merging.model";

/**
 * Represents a set of merge strategies for UI display.
 */
export class MergeStrategies {
  public strategies: Array<MergeStrategy> = [];

  /**
   * Construct merge strategies based on a JSON merging configuration.
   */
  static fromMerging(merging: Merging) {
    const result = new MergeStrategies();
    const algs = merging.algorithms['custom'];
    if (merging.mergeStrategies) {
      merging.mergeStrategies.forEach(mStr => {
        result.strategies.push(MergeStrategy.fromMerging(mStr, algs));
      })
    }
    return result;
  }

  /**
   * Add a new merge strategy to the set.
   */
  addStrategy(strategy) {
    this.strategies.push(new MergeStrategy(strategy));
  }

  /**
   * Update a merge strategy in the set.
   */
  updateStrategy(strategy, index) {
    let mStr = new MergeStrategy(strategy);
    this.strategies.splice(index, 1, mStr);
  }

  /**
   * Delete a merge strategy from the set.
   */
  deleteStrategy(strategy) {
    let i = this.strategies.findIndex(s => {
      return s === strategy;
    })
    if (i >= 0) {
      this.strategies.splice(i, 1);
    }
  }

}

/**
 * Represents a merge strategy for UI display.
 */
export class MergeStrategy {
  public name: string;
  public algorithmRef: string;
  public maxValues: number;
  public maxSources: number;
  public sourceWeights: string;
  public length: Object;
  public strategy: string;
  public customUri: string;
  public customFunction: string;
  public editing: string = '';

  constructor (mStr: any = {}) {
    if (mStr.name) this.name = mStr.name;
    if (mStr.algorithmRef) this.algorithmRef = mStr.algorithmRef;
    if (mStr.maxValues) this.maxValues = mStr.maxValues;
    if (mStr.maxSources) this.maxSources = mStr.maxSources;
    if (mStr.sourceWeights) this.sourceWeights = mStr.sourceWeights;
    if (mStr.length) this.length = mStr.length;
    //if (mStr.strategy) this.strategy = mStr.strategy;
    if (mStr.customUri) this.customUri = mStr.customUri;
    if (mStr.customFunction) this.customFunction = mStr.customFunction;
  }

  /**
   * Construct a merge strategy from merging configuration data.
   */
  static fromMerging(mStr: any, algs: any) {
    let result;
    if (mStr.algorithmRef !== 'standard') {
      // Handle custom type
      result = new MergeStrategy(mStr);
      let alg = algs.find(a => {
        return a.name === mStr.algorithmRef;
      });
      if (alg && alg.at) result.customUri = alg.at;
      if (alg && alg.function) result.customFunction = alg.function;
    } else {
      // Handle standard type
      result = new MergeStrategy(mStr);
    }
    return result;
  }

}
