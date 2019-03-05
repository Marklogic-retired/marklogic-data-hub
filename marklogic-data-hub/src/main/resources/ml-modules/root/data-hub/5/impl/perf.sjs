/**
 Copyright 2012-2019 MarkLogic Corporation

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

const dataHubMetric = 'dataHubMetric';
const stepMetric = 'stepMetric';

class Performance {
  /**
   * @desc Performance Class constructor
   * @param {Object} [config]
   * @param {string} [config.performanceMetrics=false]
   */
  constructor(config = null) {
    this.config = {};
    this.config.performanceMetrics = (config && config.performanceMetrics);
    this.dataHubMetrics = [];
    this.stepMetrics = [];
  }

  performanceMetricsOn() {
    return this.config.performanceMetrics;
  }

  instrumentStep(executionContext, fun, jobId, batchId, flowName, stepModule, uri) {
    return this.instrumentFunction(executionContext, fun, stepMetric, { jobId, batchId, flowName, stepModule, uri });
  }

  instrumentDataHub(datahubObject, hierarchy = "datahub") {
    if (this.performanceMetricsOn()) {
      let perfInstance = this;
      const propertyDefinitions = Object.getOwnPropertyNames(datahubObject);
      const cachedProfilerFunctions = {};
      propertyDefinitions.forEach((dataHubKey) => {
        if (datahubObject[dataHubKey] !== perfInstance) {
          const profilerProxyHandler = {
            get(target, key) {
              const currentItem = target[key];
              if (currentItem instanceof Function) {
                let coreLibrary = `${hierarchy}.${dataHubKey}.${key}`;
                if (!cachedProfilerFunctions[coreLibrary]) {
                  cachedProfilerFunctions[coreLibrary] = perfInstance.instrumentFunction(target, currentItem, dataHubMetric, {coreLibrary, requestId: xdmp.request()});
                }
                return cachedProfilerFunctions[coreLibrary];
              } else {
                return target[key];
              }
            }
          };
          datahubObject[dataHubKey] = new Proxy(datahubObject[dataHubKey], profilerProxyHandler);
        }
      });
    }
  }

  instrumentFunction(executionContext, fun, profileType, details) {
    let perfInstance = this;
    return function() {
      let startElapsed = xdmp.elapsedTime();
      let result = fun.apply(executionContext, arguments);
      let endElapsed = xdmp.elapsedTime();
      let profileOutput = Object.assign({ time: fn.currentDateTime(), elapsedTime: endElapsed.subtract(startElapsed) }, details);
      if (profileType === stepMetric) {
        perfInstance.stepMetrics.push(profileOutput);
      } else {
        perfInstance.dataHubMetrics.push(profileOutput);
      }
      xdmp.log(xdmp.toJsonString(profileOutput));
      return result;
    };
  }
}

module.exports = Performance;
