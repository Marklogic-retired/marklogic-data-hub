import { MergeOptions, MergeOption } from "./merge-options.model";
import { MergeStrategies, MergeStrategy } from "./merge-strategies.model";
//import { MergeCollections, MergeCollection } from "./merge-collections.model";

/**
 * Represents a Smart Mastering merging configuration.
 * @see https://marklogic-community.github.io/smart-mastering-core/docs/merging-options/
 */
export class Merging {
  public matchOptions: string = '';
  public propertyDefs: Object = {
    properties: [],
    namespaces: {}
  };
  public algorithms: Object = {
    stdAlgorithm: {},
    custom: [],
    collections: {}
  };
  public mergeStrategies: Array<Strategy> = [];
  public merging: Array<Option> = [];
  public tripleMerge: {};
  constructor() {}

  /**
   * Construct based on a JSON matching configuration.
   */
  static fromConfig(config) {
    const result = new Merging();
    if(config.matchOptions) {
      result.matchOptions = config.matchOptions;
    }
    if (config.propertyDefs && config.propertyDefs.properties) {
      config.propertyDefs.properties.forEach(p => {
        result.propertyDefs['properties'].push(new Property(p));
      })
    }
    if (config.algorithms && config.algorithms.stdAlgorithm && config.algorithms.stdAlgorithm.timestamp) {
      result.algorithms['stdAlgorithm']['timestamp'] = config.algorithms.stdAlgorithm.timestamp;
    }
    if (config.algorithms && config.algorithms.custom) {
      config.algorithms.custom.forEach(a => {
        result.algorithms['custom'].push(new Algorithm(a));
      })
    }
    if(config.algorithms && config.algorithms.collections) {
      let colls = Object.keys(config.algorithms.collections);
      colls.forEach(cKey => {
        let c = config.algorithms.collections[cKey];
        result.algorithms['collections'][cKey] = new Collection(c);
      })
    }
    if (config.mergeStrategies) {
      config.mergeStrategies.forEach(mStr => {
        result.mergeStrategies.push(new Strategy(mStr));
      })
    }
    if (config.merging) {
      config.merging.forEach(mOpt => {
        result.merging.push(new Option(mOpt));
      })
    }
    if(config.tripleMerge) {
      result.tripleMerge = config.tripleMerge;
    }
    return result;
  }

  /**
   * Construct based on a UI configuration.
   */
  static fromUI(mergeOptions: MergeOptions) { //, mergeStrategies: MergeStrategies,  mergeCollections: MergeCollections) {
    const result = new Merging();
    if (mergeOptions) {
      mergeOptions.options.forEach(mOpt => {
        result.addOption(mOpt);
      })
    }
    // if (mergeStrategies) {
    //   mergeStrategies.strategies.forEach(mStr => {
    //     result.addStrategy(mStr);
    //   })
    // }
    // if (mergeCollections) {
    //   mergeCollections.collections.forEach(mColl => {
    //     result.addCollection(mColl);
    //   })
    // }
    console.log('fromUI', result);
    return result;
  }

  /**
   * Add a property name definition.
   */
  addProperty(name) {
    let found = this.propertyDefs['properties'].find(p => {
      return p.name === name;
    });
    if (!found) {
      let prop = new Property({ localname: name, name: name });
      this.propertyDefs['properties'].push(prop);
    }
  }

  /**
   * Add an algorithm definition.
   */
  addAlgorithm(name, at, fn) {
    let alg = new Algorithm({ name: name, at: at, function: fn });
    this.algorithms['algorithm'].push(alg);
  }

  /**
   * Add definitions for the included algorithms.
   */
  // addAlgorithmDefaults() {
  //   let defaultAlgs = [
  //     ['double-metaphone', '/com.marklogic.smart-mastering/algorithms/double-metaphone.xqy'],
  //     ['thesaurus', '/com.marklogic.smart-mastering/algorithms/thesaurus.xqy'],
  //     ['zip-match', '/com.marklogic.smart-mastering/algorithms/zip.xqy'],
  //     ['standard-reduction', null]
  //   ]
  //   defaultAlgs.forEach(a => {
  //     this.addAlgorithm(a[0], a[1], a[0]);
  //   })
  // }

  /**
   * Add a merge option.
   */
  addOption(mOpt) {
    console.log('addOption', mOpt);
    if (mOpt.propertyName) {
      this.addProperty(mOpt.propertyName);
    }
    if (typeof mOpt.length === 'string' || typeof mOpt.length === 'number') {
      mOpt.length = { weight: mOpt.length };
      console.log('after', mOpt);
    }
    let opt = new Option(mOpt);
    this.merging.push(opt);
    console.log('merging.addOption', this);
  }

  /**
   * Add a merge strategy.
   */
  addStrategy(mStr: MergeStrategy) {
    let thr;
    console.log('addStrategy', mStr);
    let strategy = new Strategy(mStr);
    this.mergeStrategies.push(strategy);
    console.log('merging.addStrategy', this);
  }

  /**
   * Add a merge collection.
   */
  // addCollection(mColl: MergeCollection) {
  //   let coll = new Collection(mColl);
  //   this.algorithms['collections'][mColl.type] = coll;
  // }

}

/**
 * Represents a property definition in merging options.
 */
export class Property {
  public namespace: string;
  public localname: string;
  public name: string;
  public path: string;
  constructor(p) {
    if (p.namespace) this.namespace = p.namespace;
    if (p.localname) this.localname = p.localname;
    if (p.name) this.name = p.name;
    if (p.path) this.path = p.path;
  }
}

/**
 * Represents an algorithm definition in merging options.
 */
export class Algorithm {
  public name: string;
  public namespace: string;
  public function: string;
  public at: string;
  constructor(a) {
    if (a.name) this.name = a.name;
    if (a.function) this.function = a.function;
    if (a.at) this.at = a.at;
  }
}

/**
 * Represents a collection option in merging options.
 */
export class Collection {
  public add: Array<string>;
  public remove: Array<string>;
  public set: Array<string>;
  constructor(c) {
    if (c.add) this.add = c.add;
    if (c.remove) this.remove = c.remove;
    if (c.set) this.set = c.set;
  }
}

/**
 * Represents a merge strategy in merging options.
 */
export class Strategy {
  public name: string;
  public algorithmRef: string;
  public maxValues: number;
  public maxSources: number;
  public length: Object;
  public sourceWeights: Array<any> = [];
  constructor(mStr) {
    if (mStr.name) this.name = mStr.name;
    if (mStr.algorithmRef) this.algorithmRef = mStr.algorithmRef;
    if (mStr.maxValues) this.maxValues = mStr.maxValues;
    if (mStr.maxSources) this.maxSources = mStr.maxSources;
    if (mStr.length) this.length = mStr.length;
    if (mStr.sourceWeights) {
      this.sourceWeights = [];
      mStr.sourceWeights.forEach(sw => { this.sourceWeights.push(sw); })
    }
  }
}

/**
 * Represents a merge option in merging options.
 */
export class Option {
  public propertyName: string;
  public algorithmRef: string;
  public maxValues: number;
  public maxSources: number;
  public length: Object;
  public sourceWeights: any;
  public strategy: string;
  public default: boolean;
  constructor(mOpt) {
    if (mOpt.propertyName) this.propertyName = mOpt.propertyName;
    if (mOpt.algorithmRef) this.algorithmRef = mOpt.algorithmRef;
    if (mOpt.maxValues) this.maxValues = mOpt.maxValues;
    if (mOpt.maxSources) this.maxSources = mOpt.maxSources;
    if (mOpt.length) this.length = mOpt.length;
    if (mOpt.sourceWeights) {
      this.sourceWeights = [];
      mOpt.sourceWeights.forEach(sw => { this.sourceWeights.push(sw); })
    }
    if (mOpt.strategy) this.strategy = mOpt.strategy;
    if (mOpt.default) this.default = mOpt.default;
  }
}
