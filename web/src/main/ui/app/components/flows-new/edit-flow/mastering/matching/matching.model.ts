import { MatchOptions, MatchOption } from "./match-options.model";
import { MatchThresholds, MatchThreshold } from "./match-thresholds.model";

/**
 * Represents a Smart Mastering matching configuration.
 * @see https://marklogic-community.github.io/smart-mastering-core/docs/matching-options/
 */
export class Matching {
  public dataFormat: string = 'json';
  public propertyDefs: Object = { property: [] };
  public algorithms: Object = { algorithm: [] };
  public collections: Object = { content: [] };
  public scoring: Object = {
    add: [],
    expand: [],
    reduce: []
  };
  public actions: Object = { action: [] };
  public thresholds: Object = { threshold: [] };
  public tuning: Object = { maxScan: 200 };
  constructor() {}

  /**
   * Construct based on a JSON matching configuration.
   */
  static fromConfig(config) {
    const result = new Matching();
    if(config.dataFormat) {
      result.dataFormat = config.dataFormat;
    }
    if (config.propertyDefs && config.propertyDefs.property) {
      config.propertyDefs.property.forEach(p => {
        result.propertyDefs['property'].push(new Property(p));
      })
    }
    if (config.algorithms && config.algorithms.algorithm) {
      config.algorithms.algorithm.forEach(a => {
        result.algorithms['algorithm'].push(new Algorithm(a));
      })
    }
    if(config.collections && config.collections.content) {
      result.collections['content'] = config.collections.content;
    }
    if (config.scoring && config.scoring.add) {
      config.scoring.add.forEach(a => {
        result.scoring['add'].push(new Add(a));
      })
    }
    if (config.scoring && config.scoring.expand) {
      config.scoring.expand.forEach(e => {
        result.scoring['expand'].push(new Expand(e));
      })
    }
    if (config.scoring && config.scoring.reduce) {
      config.scoring.reduce.forEach(r => {
        result.scoring['reduce'].push(new Reduce(r));
      })
    }
    if (config.actions && config.actions.action) {
      config.actions.action.forEach(a => {
        result.actions['action'].push(new Action(a));
      })
    }
    if (config.thresholds && config.thresholds.threshold) {
      config.thresholds.threshold.forEach(t => {
        result.thresholds['threshold'].push(new Threshold(t));
      })
    }
    if(config.tuning && config.tuning.maxScan) {
      result.tuning['maxScan'] = config.tuning.maxScan;
    }
    return result;
  }

  /**
   * Construct based on a UI configuration.
   */
  static fromUI(matchOptions: MatchOptions, matchThresholds: MatchThresholds) {
    const result = new Matching();
    result.addAlgorithmDefaults();
    if (matchOptions) {
      matchOptions.options.forEach(mOpt => {
        result.addOption(mOpt);
      })
    }
    if (matchThresholds) {
      matchThresholds.thresholds.forEach(mThr => {
        result.addThreshold(mThr);
      })
    }
    console.log('fromUI', result);
    return result;
  }

  /**
   * Add a property name definition.
   */
  addProperty(name) {
    let found = this.propertyDefs['property'].find(p => {
      return p.name === name;
    });
    if (!found) {
      let prop = new Property({ localname: name, name: name });
      this.propertyDefs['property'].push(prop);
    }
  }

  /**
   * Add an algorithm definition.
   */
  addAlgorithm(name, at, fn, ns) {
    let alg = new Algorithm({ name: name, function: fn, namespace: ns });
    // reduce doesn't require at property
    if (at) alg.at = at;
    this.algorithms['algorithm'].push(alg);
  }

  /**
   * Add definitions for the included algorithms.
   */
  addAlgorithmDefaults() {
    let defaultAlgs = [
      ['double-metaphone', '/com.marklogic.smart-mastering/algorithms/double-metaphone.xqy'],
      ['thesaurus', '/com.marklogic.smart-mastering/algorithms/thesaurus.xqy'],
      ['zip-match', '/com.marklogic.smart-mastering/algorithms/zip.xqy'],
      ['standard-reduction', null]
    ]
    defaultAlgs.forEach(a => {
      this.addAlgorithm(a[0], a[1], a[0], '');
    })
  }

  /**
   * Add a match option.
   */
  addOption(mOpt: MatchOption) {
    let opt;
    if (typeof mOpt.propertyName === 'string') {
      mOpt.propertyName = [mOpt.propertyName];
    }
    if (mOpt.propertyName) {
      mOpt.propertyName.forEach(p => {
        this.addProperty(p);
      })
    }
    switch(mOpt.matchType) {
      case "exact":
        opt = new Add({
          propertyName: mOpt.propertyName[0],
          weight: mOpt.weight
        });
        this.scoring['add'].push(opt);
        break;
      case "synonym":
        opt = new Expand({
          propertyName: mOpt.propertyName[0],
          algorithmRef: mOpt.algorithmRef,
          weight: mOpt.weight,
          thesaurus: mOpt.thesaurus,
          filter: mOpt.filter
        });
        this.scoring['expand'].push(opt);
        break;
      case "double metaphone":
        opt = new Expand({
          propertyName: mOpt.propertyName[0],
          algorithmRef: mOpt.algorithmRef,
          weight: mOpt.weight,
          dictionary: mOpt.dictionary,
          distanceThreshold: mOpt.distanceThreshold,
          collation: mOpt.collation
        });
        this.scoring['expand'].push(opt);
        break;
      case "zip":
        opt = new Expand({
          propertyName: mOpt.propertyName[0],
          algorithmRef: mOpt.algorithmRef,
          zip: [
            { origin: 5, weight: mOpt.zip5match9 },
            { origin: 9, weight: mOpt.zip9match5 }
          ]
        });
        this.scoring['expand'].push(opt);
        break;
      case "reduce":
        opt = new Reduce({
          algorithmRef: mOpt.algorithmRef,
          weight: mOpt.weight,
          allMatch: {
            property: mOpt.propertyName
          }
        });
        this.scoring['reduce'].push(opt);
        break;
      case "custom":
        this.addAlgorithm(mOpt.customFunction, mOpt.customUri, mOpt.customFunction, mOpt.customNs)
        opt = new Expand({
          propertyName: mOpt.propertyName[0],
          algorithmRef: mOpt.customFunction,
          weight: mOpt.weight
        });
        this.scoring['expand'].push(opt);
        break;
    }
  }

  /**
   * Add a match threshold.
   */
  addThreshold(mThr: MatchThreshold) {
    let thr = new Threshold({
      label: mThr.label,
      above: mThr.above,
    });
    if (mThr.action !== 'merge' && mThr.action !== 'notify') {
      this.addAction(mThr.customFunction, mThr.customUri, mThr.customFunction, mThr.customNs)
      thr.action = mThr.customFunction;
    } else {
      thr.action = mThr.action;
    }
    this.thresholds['threshold'].push(thr);
  }

  /**
   * Add a match threshold action.
   */
  addAction(name, at, fn, ns) {
    let alg = new Action({ name: name, at: at, function: fn, namespace: ns });
    this.actions['action'].push(alg);
  }

}

/**
 * Represents a property definition in matching options.
 */
export class Property {
  public namespace: string;
  public localname: string;
  public name: string;
  constructor(p) {
    if (p.namespace) this.namespace = p.namespace;
    if (p.localname) this.localname = p.localname;
    if (p.name) this.name = p.name;
  }
}

/**
 * Represents an algorithm definition in matching options.
 */
export class Algorithm {
  public name: string;
  public function: string;
  public at: string;
  public namespace: string;
  constructor(a) {
    if (a.name) this.name = a.name;
    if (a.function) this.function = a.function;
    if (a.at) this.at = a.at;
    if (a.namespace) this.namespace = a.namespace;
  }
}

/**
 * Represents an add (aka exact) match definition in matching options.
 */
export class Add {
  public propertyName: string;
  public weight: number;
  constructor(a) {
    if (a.propertyName) this.propertyName = a.propertyName;
    if (a.weight) this.weight = a.weight;
  }
}

/**
 * Represents an expand match definition in matching options.
 * Expand types include: synonym, double metaphone, zip code, custom
 */
export class Expand {
  public propertyName: string;
  public algorithmRef: string;
  public weight: number;
  public thesaurus: string;
  public filter: string;
  public dictionary: string;
  public distanceThreshold: string;
  public collation: string;
  public zip: Array<Object>;
  constructor(e) {
    if (e.propertyName) this.propertyName = e.propertyName;
    if (e.algorithmRef) this.algorithmRef = e.algorithmRef;
    if (e.weight) this.weight = e.weight;
    if (e.thesaurus) this.thesaurus = e.thesaurus;
    if (e.filter) this.filter = e.filter;
    if (e.dictionary) this.dictionary = e.dictionary;
    if (e.distanceThreshold) this.distanceThreshold = e.distanceThreshold;
    if (e.collation) this.collation = e.collation;
    if (e.zip) {
      this.zip = [];
      e.zip.forEach(z => { this.zip.push(z); })
    }
  }
}

/**
 * Represents an reduce match definition in matching options.
 */
export class Reduce {
  public algorithmRef: string;
  public weight: number;
  public allMatch: Object = {
    property: []
  };
  constructor(r) {
    if (r.algorithmRef) this.algorithmRef = r.algorithmRef;
    if (r.weight) this.weight = r.weight;
    if (r.allMatch.property) this.allMatch['property'] = r.allMatch.property;
  }
}

/**
 * Represents a custom action for thresholds in matching options.
 */
export class Action {
  public name: string;
  public at: string;
  public function: string;
  public namespace: string;
  constructor(a) {
    if (a.name) this.name = a.name;
    if (a.at) this.at = a.at;
    if (a.function) this.function = a.function;
    if (a.namespace) this.namespace = a.namespace;
  }
}

/**
 * Represents a threshold in matching options.
 */
export class Threshold {
  public above: number;
  public label: string;
  public action: string;
  public type: string;
  constructor(t) {
    if (t.above) this.above = t.above;
    if (t.label) this.label = t.label;
    if (t.action) this.action = t.action;
    if (t.type) this.type = t.type;
  }
}
