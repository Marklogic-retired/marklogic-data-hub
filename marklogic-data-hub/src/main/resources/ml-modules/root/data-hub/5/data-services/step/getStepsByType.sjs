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

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/read-ingestion", "execute");
xdmp.securityAssert("http://marklogic.com/data-hub/privileges/read-mapping", "execute");
xdmp.securityAssert("http://marklogic.com/data-hub/privileges/read-match-merge", "execute");

var propertiesToReturn;

const response = {
  'ingestionSteps': [],
  'mappingSteps': [],
  'matchingSteps': [],
  'mergingSteps': [],
  'masteringSteps': [],
  'customSteps': []
};

function removeAllPropertiesExcept(step) {
  if (fn.exists(propertiesToReturn)) {
    const stepCopy = {};
    for (const prop of propertiesToReturn) {
      stepCopy[prop] = step[prop];
    }
    return stepCopy;
  }
  return step;
}

const stepsOfType = cts.search(cts.collectionQuery('http://marklogic.com/data-hub/steps')).toArray().map((step) => step.toObject());
for (const step of stepsOfType) {
  const stepType = step['stepDefinitionType'] ? step['stepDefinitionType'].toLowerCase() : null;
  if (response[`${stepType}Steps`]) {
    response[`${stepType}Steps`].push(removeAllPropertiesExcept(step));
  }
}

for (const stepType in response) {
  const stepsOfType = response[stepType];
  stepsOfType.sort((stepA, stepB) => {
    var stepAName = stepA.name.toLowerCase();
    var stepBName = stepB.name.toLowerCase();
    if (stepAName < stepBName) {
      return -1;
    }
    if (stepAName > stepBName) {
      return 1;
    }
    return 0;
  });
}

response;
