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

const debug = require("/data-hub/5/impl/debug.sjs");

class Flow {

  constructor() {

  }

  getFlowNames() {

  }

  getFlows(){
    let docs = [];
    let query = cts.directoryQuery("/flows/");
    let uris = cts.uris("", null ,query);
    for (let doc of uris) {
      docs.push(cts.doc(doc).toObject());
    }
    return docs;
  }

  //note: we're using uriMatch here to avoid case sensitivity, but still strongly match on the actual flow name itself
  getFlow(name) {
    let uriMatches = cts.uriMatch('/flows/'+name+'.flow.json', ['case-insensitive']);
    if(fn.count(uriMatches) === 1){
      return cts.doc(fn.head(uriMatches)).toObject();
    } else if (fn.count(uriMatches) > 1){
      for(let uri of uriMatches) {
        if(uri === '/flows/'+name+'.flow.json'){
          return cts.doc(uriMatches).toObject();
        }
      }
    }
  }

  runFlow(flowName, options, jobId, step) {
    let flow = this.getFlow(flowName);
    if(!flow) {
      debug.log({message: 'The flow with the name '+flowName+' could not be found.', type: 'error'});
      throw Error()
    }

  }
}

module.exports = Flow;
