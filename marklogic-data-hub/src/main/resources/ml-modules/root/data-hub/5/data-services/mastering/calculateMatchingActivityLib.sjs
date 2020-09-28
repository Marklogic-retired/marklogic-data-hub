/**
 Copyright (c) 2020 MarkLogic Corporation

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
'use strict';

let rulesetNameObjectMap;
let scoreMin, scoreMax;
let combinations;
let thresholdScores;

function calculateMatchingActivity(step)
{
  // ruleset name object map: name/object (rulesetNameObjectMap)
  rulesetNameObjectMap = {};
  // ruleset name array, sorted in weight descending order (rulesetNames)
  let rulesetNames = [];
  step.matchRulesets.forEach(obj => {
    if (!obj.reduce  || obj.reduce == "false") {
      rulesetNameObjectMap[obj.name] = obj;
      rulesetNames.push(obj.name);
    }
  });
  rulesetNames = rulesetNames.sort(
    function(a, b) {
      return rulesetNameObjectMap[b].weight - rulesetNameObjectMap[a].weight;
    }
  );

  // keys are threshold scores, values are threshold objects
  let thresholdScoreObjectMap = new Map();
  // threshold score array sorted in ascending order
  thresholdScores = [];
  step.thresholds.forEach(obj => {
    thresholdScores.push(obj.score);
    if (thresholdScoreObjectMap.has(obj.score)) {
      thresholdScoreObjectMap.get(obj.score.push(obj));
    }
    else {
      let arr = [];
      arr.push(obj);
      thresholdScoreObjectMap.set(obj.score, arr);
    }
  });

  thresholdScores = [...new Set(thresholdScores)];
  thresholdScores = thresholdScores.sort(function (a, b) { return a - b; });

  // min and max threshold scores
  scoreMin = thresholdScores[0];
  scoreMax = thresholdScores[thresholdScores.length - 1];

  // key is the threshold score, value will be an array of arrays, where the inner array
  // is the rule names of a combination that meet that score
  combinations = new Map();

  combos([], 0, 0, rulesetNames);

  // get the threshold scores that we matched as a descending-order array
  let matchingScores = [];
  for (let key of combinations.keys()) {
    matchingScores.push(key);
  }
  matchingScores = matchingScores.sort(function(a, b) { return b - a; });

  // format the response
  let result =
    {
      "scale": {
        "max": matchingScores[0],
        "min": matchingScores[matchingScores.length - 1]
      },
      "thresholdActions": []
    };

  for (let score of matchingScores) {
    let objs = thresholdScoreObjectMap.get(score);
    for (let obj of objs) {
      let ta = {
        "name": obj.thresholdName,
        "action": obj.action,
        "minimumMatchContributions": []
      };
      let comboNameArrays = combinations.get(score);
      for (let comboNames of comboNameArrays) {
        let mmc = [];
        for (let name of comboNames) {
          let ruleset = rulesetNameObjectMap[name];
          let rules = ruleset.matchRules;
          let resRules = [];
          for (let rule of rules) {
            let resRule = {
              "entityPropertyPath": rule.entityPropertyPath,
              "matchAlgorithm": rule.matchType
            }
            resRules.push(resRule);
          }
          mmc.push({
            "rulesetName": ruleset.name,
            "weight": ruleset.weight,
            "matchRules": resRules
          });
        }
        ta.minimumMatchContributions.push(mmc);
      }
      result.thresholdActions.push(ta);
    }
  }

  return result;
}

function highestThreshold(score) {
  let highest = 0;
  for (let threshold of thresholdScores) {
    if (threshold > score) {
      return highest;
    }
    else {
      highest = threshold;
    }
  }
  return highest;
};

function addToCombinationsMap(score, names)
{
  if (combinations.has(score)) {
    combinations.get(score).push(names);
  }
  else {
    let arr = [];
    arr.push(names);
    combinations.set(score, arr);
  }
}

// Function called recursively to find minimum combinations of rulesets that meet or exceed thresholds
// cumuRulesets: an array of rule names
// cumuWeight: the sum of the weights of the rulesets in cumuRulesets
// lastScore: the last threshold score met by the accumulated rulesets, or zero if none met yet
// remainingRulesets: an array of ruleset names that have not been considered yet
function combos(cumuRulesets, cumuWeight, lastScore, remainingRulesets)
{
  // base case, no more rules to add, return
  if (remainingRulesets.length === 0) {
    return;
  }

  let remainingCount = remainingRulesets.length;

  let i;
  // iterate over remainingRulesets, adding each to the cumuRulesets array and
  // looking for a new threshold to be met
  for (i = 0; i < remainingCount; i++) {
    let name = remainingRulesets[i];
    let weight = rulesetNameObjectMap[name].weight;
    let newCumuWeight = cumuWeight + weight;

    // the new combination exceeds the maximum threshold, add to results map.
    // we don't need to add to this combination, so no recursion
    if (newCumuWeight >= scoreMax) {
      addToCombinationsMap(scoreMax, cumuRulesets.concat(name));
    }
    else {
      let highest = highestThreshold(newCumuWeight);

      // if new combination exceeds a higher threshold than previously, add to results map
      if (newCumuWeight >= scoreMin && highest > lastScore) {
        addToCombinationsMap(highest, cumuRulesets.concat(name))
      }

      combos(
        cumuRulesets.concat(name),
        newCumuWeight,
        highest,
        remainingRulesets.slice(i + 1)
      );
    }
  }
}

module.exports = {
  calculateMatchingActivity
};
