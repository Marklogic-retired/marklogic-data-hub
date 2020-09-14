'use strict';

function updateMatchOptions(opt)
{
  let matchRulesets = [];
  let thresholds = [];
  let newOpt = {
    matchRulesets: matchRulesets,
    thresholds: thresholds
  };

  let maxWeight = maxWeightValue(opt);

  // a lookup object for properties (name -> object)
  let properties = {};
  if (opt.propertyDefs && opt.propertyDefs.property) {
    opt.propertyDefs.property.forEach((prop) => { properties[prop.name] = prop; });
  }

  // a lookup object for algorithms (name -> object)
  let algorithms = {};
  if (opt.algorithms && opt.algorithms.algorithm) {
    opt.algorithms.algorithm.forEach((alg) => { algorithms[alg.name] = alg; });
  }

  // a lookup object for actions (name -> object)
  let actions = {};
  if (opt.actions && opt.actions.action) {
    opt.actions.action.forEach((action) => { actions[action.name] = action; });
  }

  if (opt.scoring) {
    if (opt.scoring.add) {
      opt.scoring.add.forEach((item) => { matchRulesets.push(exactRuleset(item, properties, maxWeight)); });
    }
    if (opt.scoring.expand) {
      opt.scoring.expand.forEach((item) =>
        {
          if (item.algorithmRef) {
            if (item.algorithmRef === "zip-match") {
              matchRulesets.push(zipRuleset(item, properties, maxWeight));
            }
            else if (item.algorithmRef === "double-metaphone") {
              matchRulesets.push(doubleMetaphoneRuleset(item, properties, maxWeight));
            }
            else if (item.algorithmRef === "thesaurus") {
              matchRulesets.push(synonymRuleset(item, properties, maxWeight));
            }
            // custom algorithm
            else if (algorithms.hasOwnProperty(item.algorithmRef)) {
              matchRulesets.push(customRuleset(item, properties, algorithms, maxWeight));
            }
          }
        }
      );
    }
    if (opt.scoring.reduce) {
      opt.scoring.reduce.forEach((item) => { matchRulesets.push(reduceRuleset(item, properties, maxWeight)); });
    }
  }

  if (opt.thresholds && opt.thresholds.threshold) {
    opt.thresholds.threshold.forEach((thr) => { thresholds.push(threshold(thr, actions)); });
  }

  return newOpt;
};

function maxWeightValue(opt) {
  let weights = [];
  if (opt.scoring) {
    if (opt.scoring.add) {
      opt.scoring.add.forEach((item) => { weights.push(Number(item.weight)); });
    }
    if (opt.scoring.expand) {
      opt.scoring.expand.forEach((item) => { weights.push(Number(item.weight)); });
      if (opt.scoring.expand.zip) {
        opt.scoring.expand.zip.forEach((item) => { weights.push(Number(item.weight)); });
      }
    }
    if (opt.scoring.reduce) {
      opt.scoring.reduce.forEach((item) => { weights.push(Math.abs(Number(item.weight))); });
    }
  }
  return Math.max.apply(null, weights)
};

function exactRuleset(item, properties, maxWeight) {
  let ruleset = {
    "name": item.propertyName + " - Exact",
    "weight": adjustWeight(item.weight, maxWeight),
    "matchRules": [
      {
        "entityPropertyPath": properties[item.propertyName].localname,
        "matchType": "exact",
        "options": {}
      }
    ]
  };
  return ruleset
};

function zipRuleset(item, properties, maxWeight) {
  // find the max of the origin weights
  let weights = [];
  if (item.zip) {
    item.zip.forEach((z) => { weights.push(z.weight) });
  }
  let zipMaxWeight = Math.max.apply(null, weights);
  let ruleset = {
    "name": item.propertyName + " - Zip",
    "weight": adjustWeight(zipMaxWeight, maxWeight),
    "matchRules": [
      {
        "entityPropertyPath": properties[item.propertyName].localname,
        "matchType": "zip",
        "options": {}
      }
    ]
  };
  return ruleset
};

function reduceRuleset(item, properties, maxWeight) {
  if (item.allMatch) {
    let ruleset = {
      "name": item.allMatch.property.join(",") + " - Reduce",
      "weight": adjustWeight(Math.abs(Number(item.weight)), maxWeight),
      "reduce": true,
      "matchRules": []
    };
    item.allMatch.property.forEach((prop) => {
      ruleset.matchRules.push(
        {
          "entityPropertyPath": properties[prop].localname,
          "matchType": "exact",
          "options": {}
        }
      )
    });
    return ruleset
  }
  else {
    let ruleset = {
      "name": item.propertyName + " - Reduce",
      "weight": adjustWeight(Math.abs(Number(item.weight)), maxWeight),
      "reduce": true,
      "matchRules": [
        {
          "entityPropertyPath": properties[item.propertyName].localname,
          "matchType": "exact",
          "options": {}
        }
      ]
    };
    return ruleset
  }
};

function doubleMetaphoneRuleset(item, properties, maxWeight)
{
  let ruleset = {
    "name": item.propertyName + " - Double Metaphone",
    "weight": adjustWeight(item.weight, maxWeight),
    "matchRules": [
      {
        "entityPropertyPath": properties[item.propertyName].localname,
        "matchType": "doubleMetaphone",
        "options": {
          "dictionaryURI": item.dictionary,
          "distanceThreshold": Number(item.distanceThreshold)
        }
      }
    ]
  };
  return ruleset
};

function synonymRuleset(item, properties, maxWeight) {
  let ruleset = {
    "name": item.propertyName + " - Synonym",
    "weight": adjustWeight(item.weight, maxWeight),
    "matchRules": [
      {
        "entityPropertyPath": properties[item.propertyName].localname,
        "matchType": "synonym",
        "options": {
          "thesaurusURI": item.thesaurus,
          "filter": item.filter
        }
      }
    ]
  };
  return ruleset
};

function customRuleset(item, properties, algorithms, maxWeight) {
  let algorithm = algorithms[item.algorithmRef];
  let ruleset = {
    "name": item.propertyName + " - Custom",
    "weight": adjustWeight(item.weight, maxWeight),
    "matchRules": [
      {
        "entityPropertyPath": properties[item.propertyName].localname,
        "matchType": "custom",
        "algorithmModuleNamespace": algorithm.namespace,
        "algorithmModulePath": algorithm.at,
        "algorithmFunction": algorithm.function,
        "options": {}
      }
    ]
  };
  return ruleset
};

function threshold(thr, actions) {
  let t = {
    "thresholdName": thr.label,
    "action": thr.action,
    "score": Number(thr.above)
  };

  if (thr.action && thr.action !== "merge" && thr.action !== "notify") {
    let action = actions[thr.action];
    t.actionModulePath = action.at;
    t.actionModuleNamespace = action.namespace;
    t.actionModuleFunction = action.function;
  }

  return t
};

// returns a weight between 0 and 16
function adjustWeight(weight, maxWeight) {
  let w = Number(weight);

  // We pass in the absolute value of the weight in the reduce case.
  // For add or expand, make the minimum score 0
  if (w < 0) w = 0;

  // adjust weight if the max value in the options is greater than 16
  if (maxWeight > 16) {
    w = (w / (maxWeight / 16));
  }
  return w
};


module.exports = {
  updateMatchOptions
};
