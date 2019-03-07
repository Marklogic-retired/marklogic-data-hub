'use strict';
/**************************************************************************************************
 * This sample demonstrates a few more advanced features of Swagger-Express-Middleware,
 * such as setting a few options, initializing the mock data store, and adding custom middleware logic.
 **************************************************************************************************/
const _ = require('lodash');
const util = require('util');
const path = require('path');
const proxy = require('http-proxy-middleware')
const express = require('express');
const bodyParser = require('body-parser');
const swagger = require('swagger-express-middleware');
const Middleware = swagger.Middleware;
const MemoryDataStore = swagger.MemoryDataStore;
const Resource = swagger.Resource;
const Collection = swagger.Collection;
const swaggerUi = require('swagger-ui-express');
const swaggerMockDocPath = path.join(__dirname, '/api/swagger/mocks.json');
const swaggerMockDocument = require(swaggerMockDocPath);
// const swaggerFullDocPath = path.join(__dirname, '/api/swagger/full.json')
// const swaggerFullDocument = require(swaggerFullDocPath);
const uuid = function() {
  var uuid = "", i, random;
  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;

    if (i == 8 || i == 12 || i == 16 || i == 20) {
      uuid += "-"
    }
    uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
  }
  return uuid;
};

// turn off warnings
process.env.WARN = 'off';
 
let app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

let middleware = new Middleware(app);

// Initialize Swagger Express Middleware with our Swagger file
middleware.init(swaggerMockDocPath, (err) => {

  // Create a custom data store with some initial mock data
  let defaultFlowObj = {'name':'','description':'','batchSize':100,'threadCount':4,'options':{},'steps':[],'jobs':[],'latestJob':{},'isValid':false,'isRunning':false,'version':1};
  let defaultStepObj = {'name':'','description':'','type':'ingest','sourceDatabase':'staging','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{},'language':'en','version':'1'};
  let myDB = new MemoryDataStore();
  myDB.save(
    new Resource('flows', 'flow-01', {'id':'flow-01','name':'Order Flow 01','description':'My Flow01 flow desc','batchSize':100,'threadCount':4,'options':{'key':'value','key2':'value1','key3':'value1'},'steps':['step-1-flow-1','step-2-flow-1','step-3-flow-1','step-4-flow-1'],'jobs':['job-1-flow-1','job-2-flow-1','job-3-flow-1','job-4-flow-1'],'latestJob':{'id':'job-4-flow-1','flowId':'flow-1','startTime':'2019-01-31 12:10:00','endTime':'2019-01-31 13:10:00','output':[],'status':'running','runningPercent':85,'successfulEvents':500,'failedEvents':0},'isValid':true,'isRunning':false,'version':1}),
    new Resource('flows', 'flow-02', {'id':'flow-02','name':'Order Flow 2','description':'My Flow2 flow desc','batchSize':100,'threadCount':4,'options':{'key':'value','key2':'value1','key3':'value1'},'steps':['step-1-flow-2','step-2-flow-2','step-3-flow-2','step-4-flow-2'],'jobs':['job-1-flow-2','job-2-flow-2','job-3-flow-2','job-4-flow-2'],'latestJob':{'id':'job-4-flow-2','flowId':'flow-2','startTime':'2019-02-01 12:10:00','endTime':'2019-02-01 16:10:00','output':[],'status':'finished','runningPercent':null,'successfulEvents':13429,'failedEvents':63},'isValid':true,'isRunning':false,'version':1}),
    new Resource('flows', 'flow-03', {'id':'flow-03','name':'Customer Flow','description':'My Customer Flow flow desc','batchSize':100,'threadCount':4,'options':{'key':'value','key2':'value1','key3':'value1'},'steps':['step-1-flow-3','step-2-flow-3','step-3-flow-3','step-4-flow-3'],'jobs':['job-1-flow-3'],'latestJob':{'id':'job-1-flow-3','flowId':'flow-3','startTime':'2019-02-02 12:10:00','endTime':'2019-02-02 16:10:00','output':[],'status':'errored','runningPercent':null,'successfulEvents':0,'failedEvents':500},'isValid':true,'isRunning':false,'version':1}),
    new Resource('flows', 'flow-04', {'id':'flow-04','name':'Product Ingestion','description':'My Product Ingestion Flow flow desc','batchSize':100,'threadCount':4,'options':{'key':'value','key2':'value1','key3':'value1'},'steps':['step-1-flow-4'],'jobs':[],'latestJob':null,'isValid':false,'isRunning':false,'version':1}),

    new Resource('steps', 'step-1-flow-1', {'id':'step-1-flow-1','name':'Flow 01 Ingest Step','description':'My Step 1 description','type':'ingestion','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{'input_file_path':'/marklogic-data-hub/examples/healthcare','input_file_type':'documents','output_collections':'Order,Flow 01 Ingest Step,input,newCollection','output_permissions':'rest-reader,read,rest-writer,update','document_type':'json','transform_module':'/data-hub/5/transforms/mlcp-flow-transform.sjs','transform_namespace':'http://marklogic.com/data-hub/mlcp-flow-transform','transform_param':'entity-name=Order,flow-name=Flow 01 Ingest Step'},'language':'en','version':'1'}),
    new Resource('steps', 'step-2-flow-1', {'id':'step-2-flow-1','name':'Flow 01 Mapping Step','description':'My Step 2 description','type':'mapping','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{'sourceCollection':'Flow 01 Ingest Step','sourceURI':'source-doc-01.json','sourceQuery':'','targetEntity':'Order','targetEntityType':'http://example.org/Order-0.0.1/Order','sourceContext':'//','properties':{'id':{'sourcedFrom':'id'},'price':{'sourcedFrom':'price'},'products':{'sourcedFrom':'product_id'}}},'language':'en','version':'1'}),
    new Resource('steps', 'step-3-flow-1', {'id':'step-3-flow-1','name':'Flow 01 Mastering Step','description':'My Step 3 description','type':'mastering','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{'matchOptions':[{'type':'exact','properties':['ssn'],'weight':10},{'type':'synonym','properties':['firstName'],'weight':5,'thesaurusUri':'/dictionary/thesarus.xml','filter':''},{'type':'dblMetaphone','properties':['lastName'],'weight':2,'dictionaryUri':'/dictionary/dictionary.xml','distanceThreshold':30,'collation':'http://marklogic.com/collation/codepoint.xml'},{'type':'reduce','properties':['lastName'],'weightReduction':2},{'type':'zip','properties':['postal'],'weight':10,'5matches9Boost':3,'9matches5Weight':2},{'type':'custom','properties':['state'],'weight':1,'uri':'/directory/customOption.sjs','function':'customOptionFn'}],'matchThresholds':[{'name':'Definite Match','weight':20,'action':'merge'},{'name':'Custom Match','weight':1,'action':'custom','uri':'/directory/customOption.sjs','function':'customOptionFn'}],'mergeOptions':[{'type':'Standard','property':'ssn','maxValues':1,'maxSources':null,'sourceWeights':[],'lengthWeight':5},{'type':'Standard','property':'firstName','maxValues':null,'maxSources':2,'sourceWeights':[{'source':'CRM','weight':3},{'source':'ERP','weight':1}],'lengthWeight':null},{'type':'Standard','property':'lastName','maxValues':null,'maxSources':null,'sourceWeights':[],'lengthWeight':null},{'type':'Strategy: CRM Source','property':'state','maxValues':null,'maxSources':null,'sourceWeights':[{'source':'CRM','weight':3},{'source':'ERP','weight':1}],'lengthWeight':null},{'type':'Strategy: Length-Weight','property':'postal','maxValues':null,'maxSources':null,'sourceWeights':[],'lengthWeight':12}],'mergeStrategies':[{'default':true,'maxValues':10,'maxSources':5,'sourceWeights':[],'lengthWeight':null},{'default':false,'name':'CRM Source','maxValues':null,'maxSources':null,'sourceWeights':[{'source':'CRM','weight':3},{'source':'ERP','weight':1}],'lengthWeight':null},{'default':false,'name':'Length-Weight','maxValues':null,'maxSources':null,'sourceWeights':[],'lengthWeight':12}]},'language':'en','version':'1'}),
    new Resource('steps', 'step-4-flow-1', {'id':'step-4-flow-1','name':'Flow 01 Custom Step','description':'My Step 4 description','type':'custom','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{'custom':'TODO'},'language':'en','version':'1'}),
    
    new Resource('steps', 'step-1-flow-2', {'id':'step-1-flow-2','name':'Flow 02 Ingest Step','description':'My Step 1 description','type':'ingestion','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{'input_file_path':'/marklogic-data-hub/examples/healthcare','input_file_type':'documents','output_collections':'Order,Flow 02 Ingest Step,input,newCollection','output_permissions':'rest-reader,read,rest-writer,update','document_type':'json','transform_module':'/data-hub/5/transforms/mlcp-flow-transform.sjs','transform_namespace':'http://marklogic.com/data-hub/mlcp-flow-transform','transform_param':'entity-name=Order,flow-name=Flow 02 Ingest Step'},'language':'en','version':'1'}),
    new Resource('steps', 'step-2-flow-2', {'id':'step-2-flow-2','name':'Flow 02 Mapping Step','description':'My Step 2 description','type':'mapping','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{'sourceCollection':'Flow 02 Ingest Step','sourceURI':'source-doc-01.json','sourceQuery':'','targetEntity':'Order','targetEntityType':'http://example.org/Order-0.0.1/Order','sourceContext':'//','properties':{'id':{'sourcedFrom':'id'},'price':{'sourcedFrom':'price'},'products':{'sourcedFrom':'product_id'}}},'language':'en','version':'1'}),
    new Resource('steps', 'step-3-flow-2', {'id':'step-3-flow-2','name':'Flow 02 Mastering Step','description':'My Step 3 description','type':'mastering','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{'matchOptions':[{'type':'exact','properties':['ssn'],'weight':10},{'type':'synonym','properties':['firstName'],'weight':5,'thesaurusUri':'/dictionary/thesarus.xml','filter':''},{'type':'dblMetaphone','properties':['lastName'],'weight':2,'dictionaryUri':'/dictionary/dictionary.xml','distanceThreshold':30,'collation':'http://marklogic.com/collation/codepoint.xml'},{'type':'reduce','properties':['lastName'],'weightReduction':2},{'type':'zip','properties':['postal'],'weight':10,'5matches9Boost':3,'9matches5Weight':2},{'type':'custom','properties':['state'],'weight':1,'uri':'/directory/customOption.sjs','function':'customOptionFn'}],'matchThresholds':[{'name':'Definite Match','weight':20,'action':'merge'},{'name':'Custom Match','weight':1,'action':'custom','uri':'/directory/customOption.sjs','function':'customOptionFn'}],'mergeOptions':[{'type':'Standard','property':'ssn','maxValues':1,'maxSources':null,'sourceWeights':[],'lengthWeight':5},{'type':'Standard','property':'firstName','maxValues':null,'maxSources':2,'sourceWeights':[{'source':'CRM','weight':3},{'source':'ERP','weight':1}],'lengthWeight':null},{'type':'Standard','property':'lastName','maxValues':null,'maxSources':null,'sourceWeights':[],'lengthWeight':null},{'type':'Strategy: CRM Source','property':'state','maxValues':null,'maxSources':null,'sourceWeights':[{'source':'CRM','weight':3},{'source':'ERP','weight':1}],'lengthWeight':null},{'type':'Strategy: Length-Weight','property':'postal','maxValues':null,'maxSources':null,'sourceWeights':[],'lengthWeight':12}],'mergeStrategies':[{'default':true,'maxValues':10,'maxSources':5,'sourceWeights':[],'lengthWeight':null},{'default':false,'name':'CRM Source','maxValues':null,'maxSources':null,'sourceWeights':[{'source':'CRM','weight':3},{'source':'ERP','weight':1}],'lengthWeight':null},{'default':false,'name':'Length-Weight','maxValues':null,'maxSources':null,'sourceWeights':[],'lengthWeight':12}]},'language':'en','version':'1'}),
    new Resource('steps', 'step-4-flow-2', {'id':'step-4-flow-2','name':'Flow 02 Custom Step','description':'My Step 4 description','type':'custom','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{'custom':'options'},'language':'en','version':'1'}),
    
    new Resource('steps', 'step-1-flow-3', {'id':'step-1-flow-3','name':'Flow 3 Ingest Step','description':'My Step 1 description','type':'ingestion','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{'input_file_path':'/marklogic-data-hub/examples/healthcare','input_file_type':'documents','output_collections':'Order,Flow 3 Ingest Step,input,newCollection','output_permissions':'rest-reader,read,rest-writer,update','document_type':'json','transform_module':'/data-hub/5/transforms/mlcp-flow-transform.sjs','transform_namespace':'http://marklogic.com/data-hub/mlcp-flow-transform','transform_param':'entity-name=Order,flow-name=Flow 3 Ingest Step'},'language':'en','version':'1'}),
    new Resource('steps', 'step-2-flow-3', {'id':'step-2-flow-3','name':'Flow 3 Mapping Step','description':'My Step 2 description','type':'mapping','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{'sourceCollection':'Flow 3 Ingest Step','sourceURI':'source-doc-01.json','sourceQuery':'','targetEntity':'Order','targetEntityType':'http://example.org/Order-0.0.1/Order','sourceContext':'//','properties':{'id':{'sourcedFrom':'id'},'price':{'sourcedFrom':'price'},'products':{'sourcedFrom':'product_id'}}},'language':'en','version':'1'}),
    new Resource('steps', 'step-3-flow-3', {'id':'step-3-flow-3','name':'Flow 3 Mastering Step','description':'My Step 3 description','type':'mastering','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{'matchOptions':[{'type':'exact','properties':['ssn'],'weight':10},{'type':'synonym','properties':['firstName'],'weight':5,'thesaurusUri':'/dictionary/thesarus.xml','filter':''},{'type':'dblMetaphone','properties':['lastName'],'weight':2,'dictionaryUri':'/dictionary/dictionary.xml','distanceThreshold':30,'collation':'http://marklogic.com/collation/codepoint.xml'},{'type':'reduce','properties':['lastName'],'weightReduction':2},{'type':'zip','properties':['postal'],'weight':10,'5matches9Boost':3,'9matches5Weight':2},{'type':'custom','properties':['state'],'weight':1,'uri':'/directory/customOption.sjs','function':'customOptionFn'}],'matchThresholds':[{'name':'Definite Match','weight':20,'action':'merge'},{'name':'Custom Match','weight':1,'action':'custom','uri':'/directory/customOption.sjs','function':'customOptionFn'}],'mergeOptions':[{'type':'Standard','property':'ssn','maxValues':1,'maxSources':null,'sourceWeights':[],'lengthWeight':5},{'type':'Standard','property':'firstName','maxValues':null,'maxSources':2,'sourceWeights':[{'source':'CRM','weight':3},{'source':'ERP','weight':1}],'lengthWeight':null},{'type':'Standard','property':'lastName','maxValues':null,'maxSources':null,'sourceWeights':[],'lengthWeight':null},{'type':'Strategy: CRM Source','property':'state','maxValues':null,'maxSources':null,'sourceWeights':[{'source':'CRM','weight':3},{'source':'ERP','weight':1}],'lengthWeight':null},{'type':'Strategy: Length-Weight','property':'postal','maxValues':null,'maxSources':null,'sourceWeights':[],'lengthWeight':12}],'mergeStrategies':[{'default':true,'maxValues':10,'maxSources':5,'sourceWeights':[],'lengthWeight':null},{'default':false,'name':'CRM Source','maxValues':null,'maxSources':null,'sourceWeights':[{'source':'CRM','weight':3},{'source':'ERP','weight':1}],'lengthWeight':null},{'default':false,'name':'Length-Weight','maxValues':null,'maxSources':null,'sourceWeights':[],'lengthWeight':12}]},'language':'en','version':'1'}),
    new Resource('steps', 'step-4-flow-3', {'id':'step-4-flow-3','name':'Flow 3 Custom Step','description':'My Step 4 description','type':'custom','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{'custom':'options'},'language':'en','version':'1'}),
    
    new Resource('steps', 'step-1-flow-4', {'id':'step-1-flow-4','name':'Flow 4 Ingest Step','description':'My Step 1 description','type':'ingestion','sourceDatabase':'','targetDatabase':'staging','isValid':false,'isRunning':false,'config':{'input_file_path':'/marklogic-data-hub/examples/healthcare','input_file_type':'documents','output_collections':'Order,Flow 4 Ingest Step,input,newCollection','output_permissions':'rest-reader,read,rest-writer,update','document_type':'json','transform_module':'/data-hub/5/transforms/mlcp-flow-transform.sjs','transform_namespace':'http://marklogic.com/data-hub/mlcp-flow-transform','transform_param':'entity-name=Order,flow-name=Flow 4 Ingest Step'},'language':'en','version':'1'}),
    
    new Resource('collections', 'collection-01', 'collection-01'),
    new Resource('collections', 'collection-02', 'collection-02'),
    new Resource('collections', 'collection-03', 'collection-03')
  );

  // Enable Express' case-sensitive and strict options
  app.enable('case sensitive routing');
  app.enable('strict routing');

  app.use(middleware.metadata());

  // http://localhost:4200/api/swagger/doc/ - see Swagger document
  app.use(middleware.files(
    {
      apiPath: '/api/swagger/doc/',
      rawFilesPath: false
    }
  ));

  // http://localhost:4200/api/swagger-ui/ - see Swagger UI
  app.use('/api/swagger-ui/', swaggerUi.serve, swaggerUi.setup(swaggerMockDocument));

  // can only serve one Swagger UI, so below code won't work:  https://github.com/swagger-api/swagger-ui/issues/1672
  // http://localhost:4200/api/swagger/ui/full/ - see Swagger UI
  // app.use('/api/swagger/ui/full/', swaggerUi.serve, swaggerUi.setup(swaggerFullDocument));

  app.use(
    middleware.CORS(),
    // middleware.validateRequest()  // TODO: requires very thorough Swagger documentation to be in place
  );

  /**
   * FLOWS
   */
  app.get('/api/flows', (req, res, next) => {
    myDB.getCollection('flows', (err, flows) => {
      if (err) return next(err);
      // Send the response
      res.json(_.map(flows, 'data'));
    });
  });  

  app.post('/api/flows', (req, res, next) => {
    if (req.body) {
      let resData = req.body;
      resData.id = uuid();
      myDB.save(new Resource('flows', resData.id, resData), (err, flow) => {
        if (err) return next(err);
        // Send the response
        res.json(flow.data);
      });
    } else {
      next();
    }
  });  

  app.put('/api/flows/:flowId', (req, res, next) => {
    if (req.body && req.params.flowId) {
      // supposed to merge with previous item with same ID
      myDB.save(new Resource('flows', req.params.flowId, req.body), (err, flow) => {
        if (err) return next(err);
        // Send the response
        res.json(flow.data);
      });
    }
    else {
      next();
    }
  });

  app.delete('/api/flows/:flowId', (req, res, next) => {
    console.log('DELETE /flows/:flowId');
    // TODO
    if (req.params.flowId) {
      myDB.delete(new Resource('flows', req.params.flowId), (err, flow) => {
        if (err) return next(err);
        // Send the response
        res.json(flow.data);
      });
    }
    else {
      next();
    }
  });


  app.post('/api/flows/:flowId/run', (req, res, next) => {
    if (req.params.flowId && req.body) {
      let resData = req.body;
      resData.id = uuid();
      // TODO - return Job stub
      myDB.save(new Resource('jobs', resData.id, resData), (err, flow) => {
        if (err) return next(err);
        // Send the response
        res.json(flow.data);
      });
    } else {
      next();
    }
  });  


  /**
   * STEPS
   */
  app.get('/api/flows/:flowId/steps', (req, res, next) => {
    if (req.params.flowId) {
      myDB.get(new Resource('flows', req.params.flowId), (err, flow) => {
        if (err) return next(err);
        console.log('flow');
        console.log(flow);
        let stepIds = flow && flow.steps || [];
        let steps = []; // Array of Step objects
        _.forEach(stepIds, (stepId) => {
          myDB.get(new Resource('steps', stepId), (err, step) => {
            if (err) return next(err);
            // Send the response
            steps.push(step.data);
          });
        });
        res.json(steps);
      });
    } else {
      next();
    }
  });  

  app.post('/api/flows/:flowId/steps', (req, res, next) => {
    if (req.body && req.params.flowId) {
      let stepData = req.body;
      stepData.id = uuid();
      myDB.save(new Resource('steps', stepData.id, stepData), (err, step) => {
        if (err) return next(err);

        // add step to flow object
        myDB.get(new Resource('flows', req.params.flowId), (err, flow) => {
          if (err) return next(err);
          let updatedFlow = flow.data;
          updatedFlow.steps = updatedFlow.steps || [];
          updatedFlow.steps.push(step.id); // adds step id to steps Array, appended to the end
          myDB.save(new Resource('flows', req.params.flowId, updatedFlow), (err, flow) => {
            // Send the response
            res.json(step.data);
          });
        });
      });
    } else {
      next();
    }
  });  

  app.put('/api/flows/:flowId/steps/:stepId', (req, res, next) => {
    if (req.body && req.params.flowId && req.params.stepId) {
      // supposed to merge with previous item with same ID
      myDB.save(new Resource('steps', req.params.stepId, req.body), (err, step) => {
        if (err) return next(err);
        // Send the response
        res.json(step.data);
      });
    } else {
      next();
    }
  });

  app.delete('/api/flows/:flowId/steps/:stepId', (req, res, next) => {
    if (req.params.flowId && req.params.stepId) {
      myDB.delete(new Resource('steps', req.params.stepId), (err, step) => {
        if (err) return next(err);
        // Send the response
        res.json(step.data);
      });

      // remove step from flow object
      myDB.get(new Resource('flows', req.params.flowId), (err, flow) => {
        if (err) return next(err);
        let updatedFlow = flow.data;
        _.pull(updatedFlow.steps, req.params.stepId); // removes step id from steps Array
        myDB.save(new Resource('flows', req.params.flowId, updatedFlow), (err, flow) => {
          // Send the response
          res.json(flow.data);
        });
      });
    } else {
      next();
    }
  });  


  /**
   * Collections - list of all available collections
   */
  app.get('/api/collections/:databaseId', (req, res, next) => {
    if (req.params.flowId && req.params.stepId) {
      myDB.getCollection('collections', (err, collections) => {
        // Send the response
        res.json(_.map(collections, 'data'));
      });
    } else {
      next();
    }
  });

  // The mock middleware will use our custom data store,
  // which we already pre-populated with mock data
  app.use(middleware.mock(myDB));

  // standard mock use - swagger definitions only
  // app.use(middleware.mock());

  app.use(proxy({ 
    target: 'http://localhost:8080', 
    ws: true, // proxy websockets
  }))

  app.listen(8081, () => {
    console.log('Sample Mock API server is now running at http://localhost:8081');
    console.log('Swagger JSON Doc: http://localhost:4200/api/swagger/doc/');
    console.log('Swagger UI: http://localhost:4200/api/swagger-ui/');
  });

});