/**
  Copyright (c) 2021 MarkLogic Corporation

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

import httpUtils from "/data-hub/5/impl/http-utils.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";
import Perf from "/data-hub/5/impl/perf.mjs";

const cachedModules = new Map();

export default class StepDefinition {

  constructor(config = null) {
    this.performance = new Perf(config);
  }

  getStepDefinitionByNameAndType(name, type = 'custom') {
    let doc = this.getStepDefinition(name, type);
    if (doc) {
      return doc.toObject();
    }
  }

  getStepDefinition(name, type) {
    let query = [cts.collectionQuery('http://marklogic.com/data-hub/step-definition'), cts.jsonPropertyValueQuery('name', name, ['unstemmed', 'case-insensitive'])];
    if (type) {
      query.push(cts.jsonPropertyValueQuery('type', type, ['unstemmed', 'case-insensitive']));
    }
    for (const def of cts.search(cts.andQuery(query), ["score-zero", "unfaceted"], 0)) {
      if (def.toObject().name === name) {
        return def;
      }
    }
    return null;
  }

  makeFunction(flow, funcName, moduleUri) {
    let stepModule;
    try {
      stepModule = this.retrieveModuleLibrary(moduleUri);
    } catch (e) {
      if (e.stack && e.stack.includes("XDMP-MODNOTFOUND")) {
        if (e.data.join(',') == moduleUri) {
          httpUtils.throwBadRequest(`Unable to access module: ${moduleUri}. Verify that this module is in your modules database and that your user account has a role that grants read and execute permission to this module.`);
        } else {
          httpUtils.throwBadRequest(`Unable to access module ${e.data.join(',')} in ${moduleUri}. Verify that this module is in your modules database and that your user account has a role that grants read and execute permission to this module.`);
        }
      }
      httpUtils.throwBadRequest(`Unable to run module: ${moduleUri}; cause: ${e.stack}`);
    }
    // TODO Disabling this for now to avoid dependency on globalContext; will rework it soon so that it's still functional
    // if (this.performance.performanceMetricsOn())  {
    //   return this.performance.instrumentStep(stepModule, stepModule[funcName], TODO.jobId, TODO.batchId, TODO.flow.name, moduleUri, TODO.uri);
    // }
    return stepModule[funcName];
  }


  retrieveModuleLibrary(moduleLibraryURI) {
    if (!cachedModules.has(moduleLibraryURI)) {
      let extension = moduleLibraryURI.split(".").pop();
      if (extension === "mjs") {
        cachedModules.set(moduleLibraryURI, hubUtils.requireMjsModule(moduleLibraryURI));
      } else {
        cachedModules.set(moduleLibraryURI, require(moduleLibraryURI));
      }
    }
    return cachedModules.get(moduleLibraryURI);
  }
}


