import { Matching } from "./matching.model";

/**
 * Represents a set of match thresholds for UI display.
 */
export class MatchThresholds {
  public thresholds: Array<MatchThreshold> = [];

  /**
   * Construct match thresholds based on a JSON matching configuration.
   */
  static fromMatching(matching: Matching) {
    const result = new MatchThresholds();
    const acts = matching.actions['action'];
    if (matching.thresholds && matching.thresholds['threshold']) {
      matching.thresholds['threshold'].forEach(t => {
        result.thresholds.push(MatchThreshold.fromMatching(t, acts));
      })
    }
    return result;
  }

  /**
   * Add a match threshold to the set.
   */
  addThreshold(thr) {
    this.thresholds.push(new MatchThreshold(thr));
  }

  /**
   * Update a match threshold in the set.
   */
  updateThreshold(thr, index) {
    let mThr = new MatchThreshold({
      label: thr.label,
      above: thr.above,
      action: thr.action
    });
    if (thr.action === 'custom') {
      if (thr.customUri) mThr.customUri = thr.customUri;
      if (thr.customFunction) mThr.customFunction = thr.customFunction;
      if (thr.customNs) mThr.customNs = thr.customNs;
    }
    this.thresholds.splice(index, 1, mThr);
  }

  /**
   * Delete a match threshold from the set.
   */
  deleteThreshold(thr) {
    let i = this.thresholds.findIndex(t => {
      return t === thr;
    })
    if (i >= 0) {
      this.thresholds.splice(i, 1);
    }
  }

}

/**
 * Represents a match threshold for UI display.
 */
export class MatchThreshold {
  public label: string;
  public above: string;
  public action: string;
  public customUri: string;
  public customFunction: string;
  public customNs: string;

  constructor(mThr: any) {
    if (mThr.label) this.label = mThr.label;
    if (mThr.above) this.above = mThr.above;
    if (mThr.action) this.action = mThr.action;
    if (mThr.customUri) this.customUri = mThr.customUri;
    if (mThr.customFunction) this.customFunction = mThr.customFunction;
    if (mThr.customNs) this.customNs = mThr.customNs;
  }

  /**
   * Construct a match threshold from matching configuration data.
   */
  static fromMatching(mThr: any, acts: any) {
    const result = new MatchThreshold(mThr);
    if (mThr.action !== 'merge' && mThr.action !== 'notify' ) {
      let act = acts.find(a => {
        return a.name === mThr.action;
      });
      if (act && act.at) result.customUri = act.at;
      if (act && act.function) result.customFunction = act.function;
      if (act && act.namespace) result.customNs = act.namespace;
      result.action = 'custom';
    }
    return result;
  }

}
