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

}

export class MatchThreshold {
  public label: Array<string>;
  public above: string;
  public action: string;

  constructor(mThr: any) {
    if (mThr.label) this.label = mThr.label;
    if (mThr.above) this.above = mThr.above;
    if (mThr.action) this.action = mThr.action;
  }

}
