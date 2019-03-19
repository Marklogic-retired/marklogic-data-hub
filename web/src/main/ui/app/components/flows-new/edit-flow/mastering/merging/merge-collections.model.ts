import { Merging } from "./merging.model";

/**
 * Represents a set of merge collections for UI display.
 */
export class MergeCollections {
  public collections: Array<MergeCollection> = [];

  /**
   * Construct merge collections based on a JSON merging configuration.
   */
  static fromMerging(merging: Merging) {
    const result = new MergeCollections();
    if (merging.algorithms['collections']) {
      let colls = Object.keys(merging.algorithms['collections']);
      colls.forEach(cKey => {
        let c = merging.algorithms['collections'][cKey];
        result.collections.push(MergeCollection.fromMerging(cKey, c));
      })
    }
    return result;
  }

  /**
   * Add a new match option to the set.
   */
  addCollection(coll) {
    this.collections.push(new MergeCollection(coll));
  }

  /**
   * Update a match option in the set.
   */
  updateStrategy(coll, index) {
    let mColl = new MergeCollection(coll);
    this.collections.splice(index, 1, mColl);
  }

  /**
   * Delete a match option from the set.
   */
  deleteOption(coll) {
    let i = this.collections.findIndex(s => {
      return s === coll;
    })
    if (i >= 0) {
      this.collections.splice(i, 1);
    }
  }

}

/**
 * Represents a merge strategy for UI display.
 */
export class MergeCollection {
  public event: string;
  public add: Array<any>;
  public remove: Array<any>;
  public set: Array<any>;

  constructor (mStr: any = {}) {
    if (mStr.event) this.event = mStr.event;
    if (mStr.add) this.add = mStr.add;
    if (mStr.remove) this.remove = mStr.remove;
    if (mStr.set) this.set = mStr.set;
  }

  /**
   * Construct a merge option from merging configuration data.
   */
  static fromMerging(event: string, coll: any) {
    const result = new MergeCollection({ event: event });
    if (coll.add && coll.add.collection) result.add = coll.add.collection;
    if (coll.remove && coll.remove.collection) result.remove = coll.remove.collection;
    if (coll.set && coll.set.collection) result.set = coll.set.collection;
    return result;
  }

}
