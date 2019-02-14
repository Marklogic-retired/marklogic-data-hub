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

class Process {

  constructor(config = null) {
    if(!config) {
      config = defaultConfig;
    }
    this.config = config;
    this.hubUtils= new HubUtils(config);
    this.processTypes = ['ingest', 'mapping', 'custom'];
  }

  getProcessTypes() {
    return this.processTypes;
  }

  getProcessNames(){
    let names = {};
    for(let type of this.getProcessTypes()){
      let query = [cts.jsonPropertyValueQuery('type', type),  cts.collectionQuery('http://marklogic.com/data-hub/process')];
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

  getProcesses() {
    let query = [cts.directoryQuery('/processes/', 'infinity'),  cts.collectionQuery('http://marklogic.com/data-hub/process')];
    return cts.search(cts.andQuery(query)).toArray();
  }

  getProcessNamesByType(type = 'custom') {
    let names = [];
    let query = [cts.jsonPropertyValueQuery('type', type),  cts.collectionQuery('http://marklogic.com/data-hub/process')];
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

  getProcessesByType(type = 'custom') {
    let query = [cts.collectionQuery('http://marklogic.com/data-hub/process'), cts.jsonPropertyValueQuery('type', type)];
    return cts.search(cts.andQuery(query)).toArray();
  }

  getProcess(name, type = 'custom') {
    let query = [cts.collectionQuery('http://marklogic.com/data-hub/process'), cts.jsonPropertyValueQuery('name', name), cts.jsonPropertyValueQuery('type', type)];
    let doc = fn.head(cts.search(cts.andQuery(query)));
    if(doc){
      doc = doc.toObject();
    }
    return doc;
  }

  deleteProcess(name, type) {
    let uris = cts.uris("", null ,cts.andQuery([cts.directoryQuery("/processes/"),cts.collectionQuery('http://marklogic.com/data-hub/process'),
      cts.jsonPropertyValueQuery("name", name), cts.jsonPropertyValueQuery("type", type)]));
    for (let doc of uris) {
      if (fn.docAvailable(doc)){
        this.hubUtils.deleteDocument(doc, this.config.STAGINGDATABASE);
      }
    }
  }

}



module.exports = Process;
