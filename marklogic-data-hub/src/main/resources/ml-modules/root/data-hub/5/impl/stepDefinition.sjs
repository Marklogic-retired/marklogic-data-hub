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

const httpUtils = require("/data-hub/5/impl/http-utils.sjs");

const cachedModules = {};

class StepDefinition {

  constructor(config = null, datahub = null) {
    if (!datahub) {
      const Perf = require("/data-hub/5/impl/perf.sjs");
      this.performance = new Perf(config);
    } else {
      this.performance = datahub.performance;
    }
  }

  getStepDefinitionByNameAndType(name, type = 'custom') {
    let doc = this.getStepDefinition(name, type);
    if(doc) {
      return doc.toObject();
    }
  }

  getStepProcessor(flow, name, type = 'custom') {
    let doc = this.getStepDefinition(name, type);
    if(doc){
      doc = doc.toObject();
      doc.run = this.makeFunction(flow, "main", doc.modulePath);
    }
    return doc;
  }

  getStepDefinition(name, type = 'custom'){
    let query = [cts.collectionQuery('http://marklogic.com/data-hub/step-definition'), cts.jsonPropertyValueQuery('name', name, 'case-insensitive'), cts.jsonPropertyValueQuery('type', type, 'case-insensitive')];
    return cts.search(cts.andQuery(query)).toArray().find(artifact => artifact.toObject().name === name);
  }

  makeFunction(flow, funcName, moduleUri) {
    let stepModule;
    try {
      stepModule = this.retrieveModuleLibrary(moduleUri);
    } catch (e) {
      if(e.stack && e.stack.includes("XDMP-MODNOTFOUND")){
        httpUtils.throwBadRequest(`Unable to access module: ${moduleUri}. Verify that this module is in your modules database and that your user account has a role that grants read and execute permission to this module`);
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
    if (!cachedModules[moduleLibraryURI]) {
      cachedModules[moduleLibraryURI] = require(moduleLibraryURI);
    }
    return cachedModules[moduleLibraryURI];
  } 
}

module.exports = StepDefinition;
