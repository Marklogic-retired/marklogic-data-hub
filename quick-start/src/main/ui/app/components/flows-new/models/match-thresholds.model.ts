import { Matching } from "./matching.model";

export class MatchThresholds {
  public thresholds: Array<MatchThreshold> = [];

  static fromJSON(matching: Matching) {
    const result = new MatchThresholds();
    if (matching.thresholds && matching.thresholds['threshold']) {
      matching.thresholds['threshold'].forEach(t => {
        result.thresholds.push(new MatchThreshold(t));
      })
    }
    return result;
  }

  /**
   * Add a new match threshold.
   */
  addThreshold(thr) {
    this.thresholds.push(new MatchThreshold(thr));
  }

  /**
   * Update a match threshold.
   */
  updateThreshold(thr, index) {
    let mThr = new MatchThreshold(thr);
    this.thresholds.splice(index, 1, mThr);
  }

  /**
   * Delete a match threshold.
   */
  deleteThreshold(index) {
    this.thresholds.splice(index, 1);
  }

}

export class MatchThreshold {
  public label: string;
  public above: string;
  public action: string;

  constructor(mThr: any) {
    if (mThr.label) this.label = mThr.label;
    if (mThr.above) this.above = mThr.above;
    if (mThr.action) this.action = mThr.action;
  }

}
