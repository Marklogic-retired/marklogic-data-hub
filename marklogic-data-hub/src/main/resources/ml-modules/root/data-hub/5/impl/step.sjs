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

const HubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const defaultConfig = require("/com.marklogic.hub/config.sjs");

class Step {

  constructor(config = null) {
    if(!config) {
      config = defaultConfig;
    }
    this.config = config;
    this.hubUtils= new HubUtils(config);
    this.stepTypes = ['ingest', 'mapping', 'custom'];
  }

  getStepTypes() {
    return this.stepTypes;
  }

  getStepNames(){
    let names = {};
    for(let type of this.getStepTypes()){
      let query = [cts.jsonPropertyValueQuery('type', type),  cts.collectionQuery('http://marklogic.com/data-hub/step')];
      let docs = cts.search(cts.andQuery(query));
      names[type] = [];
      if(docs) {
        for(let doc of docs) {
          let name = doc.xpath('/name');
          if(name) {
            names[type].push(name);
          }
        }
      }
    }
    return names;
  }

  getSteps() {
    let query = [cts.directoryQuery('/steps/', 'infinity'),  cts.collectionQuery('http://marklogic.com/data-hub/step')];
    return cts.search(cts.andQuery(query)).toArray();
  }

  getStepNamesByType(type = 'custom') {
    let names = [];
    let query = [cts.jsonPropertyValueQuery('type', type),  cts.collectionQuery('http://marklogic.com/data-hub/step')];
    let docs = cts.search(cts.andQuery(query));
    if(docs) {
      for(let doc of docs) {
        let name = doc.xpath('/name');
        if(name) {
          names.push(name);
        }
      }
    }
  return names;
  }

  getStepsByType(type = 'custom') {
    let query = [cts.collectionQuery('http://marklogic.com/data-hub/step'), cts.jsonPropertyValueQuery('type', type)];
    return cts.search(cts.andQuery(query)).toArray();
  }

  getStepProcessor(name, type = 'custom') {
    let query = [cts.collectionQuery('http://marklogic.com/data-hub/step'), cts.jsonPropertyValueQuery('name', name), cts.jsonPropertyValueQuery('type', type)];
    let doc = fn.head(cts.search(cts.andQuery(query)));
    if(doc){
      doc = doc.toObject();
      doc.run = this.makeFunction("main", doc.modulePath);
    }
    return doc;
  }

  deleteSteps(name, type) {
    let uris = cts.uris("", null ,cts.andQuery([cts.directoryQuery("/steps/"),cts.collectionQuery('http://marklogic.com/data-hub/step'),
      cts.jsonPropertyValueQuery("name", name), cts.jsonPropertyValueQuery("type", type)]));
    for (let doc of uris) {
      if (fn.docAvailable(doc)){
        this.hubUtils.deleteDocument(doc, this.config.STAGINGDATABASE);
      }
    }
  }

  //grab the module and require it
  makeFunction(funcName, moduleUri) {
    return this.hubUtils.retrieveModuleLibrary(moduleUri)[funcName];
  };

}



module.exports = Step;
