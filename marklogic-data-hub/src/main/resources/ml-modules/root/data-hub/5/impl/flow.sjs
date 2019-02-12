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
const Debug = require("/data-hub/5/impl/debug.sjs");
const Process = require("/data-hub/5/impl/process.sjs");
const Jobs = require("/data-hub/5/impl/jobs.sjs");
const defaultConfig = require("/com.marklogic.hub/config.sjs");

class Flow {

  constructor(config = null) {
    if (!config) {
      config = defaultConfig;
    }
    this.config = config;
    this.debug = new Debug(config);
    this.hubUtils = new HubUtils(config);
    this.process = new Process(config);
    this.jobs = new Jobs(config);
    this.writeQueue = {};
    this.globalContext = {
      flow : {},
      jobId: '',
      attemptStep: 1,
      lastCompletedStep: 0,
      lastAttemptedStep: 0,
      targetDb: config.FINALDATABASE,
      sourceDb: config.STAGINGDATABASE
    };
  }

  getFlowNames() {
    let names = [];
    let query = [cts.directoryQuery("/flows/"), cts.collectionQuery('http://marklogic.com/data-hub/flow')];
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

  getFlows(){
    let docs = [];
    let query = cts.directoryQuery("/flows/");
    let uris = cts.uris("", null ,query);
    for (let doc of uris) {
      docs.push(cts.doc(doc).toObject());
    }
    return docs;
  }

  deleteFlow(flowName) {
    let uris = cts.uris("", null ,cts.andQuery([cts.orQuery([cts.directoryQuery("/flows/"),cts.collectionQuery("http://marklogic.com/data-hub/flow")]),
      cts.jsonPropertyValueQuery("name", flowName)]));
    for (let doc of uris) {
      if (fn.docAvailable(doc)){
        this.hubUtils.deleteStagingDocument(doc);
      }
    }
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

  setFlow(flowObj){
    this.globalContext.flow = flowObj;
  }

  addToWriteQueue(uri, content, context) {
      this.writeQueue[uri] = {
        content: content,
        context: context
      }
  }

  runFlow(flowName, jobId, uri, content, options, stepNumber) {
    let flow = this.getFlow(flowName);
    if(!flow) {
      this.debug.log({message: 'The flow with the name '+flowName+' could not be found.', type: 'error'});
      throw Error('The flow with the name '+flowName+' could not be found.')
    }
    //set the flow in the context
    this.globalContext.flow = flow;

    let jobDoc = this.jobs.getJobDocWithId(jobId);
    if(!jobDoc){
      jobDoc = this.jobs.createJob(flowName, jobId);
    }
    //set the jobid in the context based on the jobdoc response
    this.globalContext.jobId = jobDoc.jobId;
    this.globalContext.lastCompletedStep = jobDoc.lastCompletedStep;
    this.globalContext.lastAttemptedStep = jobDoc.lastAttemptedStep;

    //grab the step, or the first if its null/not set
    if(!stepNumber) {
      stepNumber = 1;
    }

    //set the context for the attempted step
    this.globalContext.attemptStep = stepNumber;

    let step = this.globalContext.flow.steps[stepNumber];
    if(!step) {
      this.debug.log({message: 'Step '+stepNumber+' for the flow: '+flowName+' could not be found.', type: 'error'});
      throw Error('Step '+stepNumber+' for the flow: '+flowName+' could not be found.')
    }

    if(step.targetDb) {
      this.globalContext.targetDb = step.targetDb;
    }
    if(step.sourceDb) {
      this.globalContext.sourceDb = step.sourceDb;
    }

    let process = this.process.getProcess(step.name, step.type);


    let processMainFunc = this.makeFunction("main", process.modulePath);
    if(!processMainFunc) {
      this.debug.log({message: 'Could not find main() function for process '+step.type+'/'+step.name+' for step # '+stepNumber+' for the flow:'+flowName+' could not be found.', type: 'error'});
      throw Error('Could not find main() function for process '+step.type+'/'+step.name+' for step # '+stepNumber+' for the flow:'+flowName+' could not be found.')
    }

    //here we consolidate options and override in order of priority: runtime flow options, step defined options, process defined options
    let combinedOptions = Object.assign(process.options, step.options, options);

    let result = this.runMain(uri, content, combinedOptions, processMainFunc);

    //let's update our jobdoc now, assuming success
    //this.jobs.updateJob(this.globalContext.jobId, stepNumber, stepNumber, "finished");

    return result;
  }


  runMain(uri, content, options, func) {
    let resp;
    try {
        resp = func(uri, content, options);
    }
    catch(ex) {
        //ruh roh, time to log our failure :(
        //this.jobs.updateJob(this.globalContext.jobId, this.globalContext.attemptStep, this.globalContext.lastCompletedStep, "failed");
        throw(ex);
    }
    if (resp instanceof Sequence) {
      resp = fn.head(resp);
    }
    return resp;
  };

  //grab the module and require it
  makeFunction(funcName, moduleUri) {
    return require(moduleUri)[funcName];
  };
}

module.exports = Flow;
