'use strict';
const _ = require('lodash');

let defaultFlowObj = {'name':'','description':'','batchSize':100,'threadCount':4,'options':{},'steps':[],'jobs':[],'latestJob':{},'isValid':false,'isRunning':false,'version':1};
let defaultStepObj = {'name':'','description':'','type':'ingest','sourceDatabase':'staging','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{},'language':'en','version':'1'};

let collections = {
  'flows': [
    {'id':'flow-01','name':'Order Flow 01','description':'My Flow01 flow desc','batchSize':100,'threadCount':4,'options':{'key':'value','key2':'value1','key3':'value1'},'steps':[{ id: 'step-1-flow-1', name:'Flow 01 Ingest Step', type:'ingestion' },{ id: 'step-2-flow-1', name:'Flow 01 Mapping Step', type:'mapping', targetEntity: 'Order' },{ id: 'step-3-flow-1', name:'Flow 01 Mastering Step', type:'mastering', targetEntity: 'Order' },{ id: 'step-4-flow-1', name:'Flow 01 Custom Step', type:'custom', targetEntity: 'Order' }],'jobs':['job-1-flow-1','job-2-flow-1','job-3-flow-1','job-4-flow-1'],'latestJob':{'id':'job-4-flow-1','flowId':'flow-1','startTime':'2019-01-31 12:10:00','endTime':'2019-01-31 13:10:00','output':[],'status':'never run','runningPercent':null,'successfulEvents':500,'failedEvents':0},'isValid':true,'isRunning':false,'version':1},
    {'id':'flow-02','name':'Order Flow 2','description':'My Flow2 flow desc','batchSize':100,'threadCount':4,'options':{'key':'value','key2':'value1','key3':'value1'},'steps':[{ id: 'step-1-flow-2', name:'Flow 02 Ingest Step', type:'ingestion' },{ id: 'step-2-flow-2', name:'Flow 02 Mapping Step', type:'mapping', targetEntity: 'Order' },{ id: 'step-3-flow-2', name:'Flow 02 Mastering Step', type:'mastering', targetEntity: 'Order' },{ id: 'step-4-flow-2', name:'Flow 02 Custom Step', type:'custom', targetEntity: 'Order' }],'jobs':['job-1-flow-2','job-2-flow-2','job-3-flow-2','job-4-flow-2'],'latestJob':{'id':'job-4-flow-2','flowId':'flow-2','startTime':'2019-02-01 12:10:00','endTime':'2019-02-01 16:10:00','output':[],'status':'finished','runningPercent':null,'successfulEvents':13429,'failedEvents':63},'isValid':true,'isRunning':false,'version':1},
    {'id':'flow-03','name':'Customer Flow','description':'My Customer Flow flow desc','batchSize':100,'threadCount':4,'options':{'key':'value','key2':'value1','key3':'value1'},'steps':[{ id: 'step-1-flow-3', name:'Flow 03 Ingest Step', type:'ingestion' },{ id: 'step-2-flow-3', name:'Flow 03 Mapping Step', type:'mapping', targetEntity: 'Order' },{ id: 'step-3-flow-3', name:'Flow 03 Mastering Step', type:'mastering', targetEntity: 'Order' },{ id: 'step-4-flow-3', name:'Flow 03 Custom Step', type:'custom', targetEntity: 'Order' }],'jobs':['job-1-flow-3'],'latestJob':{'id':'job-1-flow-3','flowId':'flow-3','startTime':'2019-02-02 12:10:00','endTime':'2019-02-02 16:10:00','output':[],'status':'errored','runningPercent':null,'successfulEvents':0,'failedEvents':500},'isValid':true,'isRunning':false,'version':1},
    {'id':'flow-04','name':'Product Ingestion','description':'My Product Ingestion Flow flow desc','batchSize':100,'threadCount':4,'options':{'key':'value','key2':'value1','key3':'value1'},'steps':[{ id: 'step-1-flow-4', name:'Flow 04 Custom Step', type:'custom', targetEntity: 'Order' }],'jobs':[],'latestJob':null,'isValid':false,'isRunning':false,'version':1}
  ],
  'steps': [
    {'id':'step-1-flow-1','name':'Flow 01 Ingest Step','description':'My Step 1 description','type':'ingestion','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{'input_file_path':'/marklogic-data-hub/examples/healthcare','input_file_type':'documents','output_collections':'Order,Flow 01 Ingest Step,input,newCollection','output_permissions':'rest-reader,read,rest-writer,update','document_type':'json','transform_module':'/data-hub/5/transforms/mlcp-flow-transform.sjs','transform_namespace':'http://marklogic.com/data-hub/mlcp-flow-transform','transform_param':'entity-name=Order,flow-name=Flow 01 Ingest Step'},'language':'en','version':'1'},
    {'id':'step-2-flow-1','name':'Flow 01 Mapping Step','description':'My Step 2 description','type':'mapping','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{'sourceCollection':'Flow 01 Ingest Step','sourceURI':'source-doc-01.json','sourceQuery':'','targetEntity':'Order','targetEntityType':'http://example.org/Order-0.0.1/Order','sourceContext':'//','properties':{'id':{'sourcedFrom':'id'},'price':{'sourcedFrom':'price'},'products':{'sourcedFrom':'product_id'}}},'language':'en','version':'1'},
    {'id':'step-3-flow-1','name':'Flow 01 Mastering Step','description':'My Step 3 description','type':'mastering','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{ "matchOptions": { "dataFormat": "json", "propertyDefs": { "property": [ { "namespace": "", "localname": "ssn", "name": "ssn" }, { "namespace": "", "localname": "firstName", "name": "firstName" }, { "namespace": "", "localname": "lastName", "name": "lastName" }, { "namespace": "", "localname": "addr", "name": "addr" }, { "namespace": "", "localname": "city", "name": "city" }, { "namespace": "", "localname": "state", "name": "state" }, { "namespace": "", "localname": "postal", "name": "postal" } ] }, "algorithms": { "algorithm": [ { "name": "standard-reduction", "function": "standard-reduction" }, { "name": "double-metaphone", "at": "/com.marklogic.smart-mastering/algorithms/double-metaphone.xqy", "function": "double-metaphone" }, { "name": "thesaurus", "at": "/com.marklogic.smart-mastering/algorithms/thesaurus.xqy", "function": "thesaurus" }, { "name": "zip-match", "at": "/com.marklogic.smart-mastering/algorithms/zip.xqy", "function": "zip-match" }, { "name": "customOption", "at": "/directory/customOption.sjs", "function": "customOption" } ] }, "collections": { "content": [ "mdm-content" ] }, "scoring": { "add": [ { "propertyName": "ssn", "weight": 10 }, { "propertyName": "postal", "weight": 5 } ], "expand": [ { "propertyName": "firstName", "algorithmRef": "thesaurus", "weight": 5, "thesaurus": "/directory/thesaurus.xml", "filter": "" }, { "propertyName": "lastName", "algorithmRef": "double-metaphone", "weight": 2, "dictionary": "/directory/dictionary.xml", "distanceThreshold": "30", "collation": "http://marklogic.com/collation/codepoint" }, { "propertyName": "state", "algorithmRef": "customOption", "weight": 1 }, { "propertyName": "postal", "algorithmRef": "zip-match", "zip": [ { "origin": 5, "weight": 3 }, { "origin": 9, "weight": 2 } ] } ], "reduce": [ { "algorithmRef": "standard-reduction", "weight": 4, "allMatch": { "property": [ "lastName", "addr" ] } } ] }, "actions": { "action": [ { "name": "customAction", "at": "/directory/customAction.sjs", "function": "customAction" } ] }, "thresholds": { "threshold": [ { "above": "20", "label": "Definite Match", "action": "merge" }, { "above": "10", "label": "Likely Match", "action": "notify" }, { "above": "7", "label": "Custom Match", "action": "customAction" } ] }, "tuning": { "maxScan": "200" } }, "mergeOptions": { "matchOptions": "matchOptions", "propertyDefs": { "properties": [ { "namespace": "", "localname": "ssn", "name": "ssn" }, { "namespace": "", "localname": "firstName", "name": "firstName" }, { "namespace": "", "localname": "lastName", "name": "lastName" }, { "namespace": "", "localname": "addr", "name": "addr" }, { "namespace": "", "localname": "city", "name": "city" }, { "namespace": "", "localname": "state", "name": "state" }, { "namespace": "", "localname": "postal", "name": "postal" } ], "namespaces": {} }, "algorithms": { "stdAlgorithm": { "namespaces": {}, "timestamp": { "path": "/path/to/timestamp" } }, "custom": [], "collections": { "onMerge": { "remove": { "collection": [ "coll-to-add" ] }, "add": { "collection": [ "coll-to-remove" ] } }, "onNoMatch": { "set": { "collection": [ "coll-to-set" ] } }, "onNotification": { "add": { "collection": [ "coll3", "coll4" ] } }, "onArchive": { "remove": { "collection": [ "arch-coll" ] } } } }, "mergeStrategies": [ { "name": "CRM Source", "algorithmRef": "standard", "sourceWeights": [ { "source": { "name": "CRM", "weight": 3 } }, { "source": { "name": "ERP", "weight": 1 } } ] }, { "name": "Length-Weight", "algorithmRef": "standard", "length": { "weight": 12 } } ], "merging": [ { "propertyName": "ssn", "maxValues": 1, "length": { "weight": 5 } }, { "propertyName": "firstName", "maxValues": 2, "sourceWeights": [ { "source": { "name": "Oracle", "weight": 20 } } ] }, { "propertyName": "state", "strategy": "CRM Source" }, { "propertyName": "postal", "strategy": "Length-Weight" }, { "default": true, "maxValues": 10, "maxSources": 5 } ], "tripleMerge": {} } },'language':'en','version':'1'},
    {'id':'step-4-flow-1','name':'Flow 01 Custom Step','description':'My Step 4 description','type':'custom','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{'custom':'TODO'},'language':'en','version':'1'},
    {'id':'step-1-flow-2','name':'Flow 02 Ingest Step','description':'My Step 1 description','type':'ingestion','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{'input_file_path':'/marklogic-data-hub/examples/healthcare','input_file_type':'documents','output_collections':'Order,Flow 02 Ingest Step,input,newCollection','output_permissions':'rest-reader,read,rest-writer,update','document_type':'json','transform_module':'/data-hub/5/transforms/mlcp-flow-transform.sjs','transform_namespace':'http://marklogic.com/data-hub/mlcp-flow-transform','transform_param':'entity-name=Order,flow-name=Flow 02 Ingest Step'},'language':'en','version':'1'},
    {'id':'step-2-flow-2','name':'Flow 02 Mapping Step','description':'My Step 2 description','type':'mapping','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{'sourceCollection':'Flow 02 Ingest Step','sourceURI':'source-doc-01.json','sourceQuery':'','targetEntity':'Order','targetEntityType':'http://example.org/Order-0.0.1/Order','sourceContext':'//','properties':{'id':{'sourcedFrom':'id'},'price':{'sourcedFrom':'price'},'products':{'sourcedFrom':'product_id'}}},'language':'en','version':'1'},
    {'id':'step-3-flow-2','name':'Flow 02 Mastering Step','description':'My Step 3 description','type':'mastering','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{ "matchOptions": { "dataFormat": "json", "propertyDefs": { "property": [ { "namespace": "", "localname": "ssn", "name": "ssn" }, { "namespace": "", "localname": "firstName", "name": "firstName" }, { "namespace": "", "localname": "lastName", "name": "lastName" }, { "namespace": "", "localname": "addr", "name": "addr" }, { "namespace": "", "localname": "city", "name": "city" }, { "namespace": "", "localname": "state", "name": "state" }, { "namespace": "", "localname": "postal", "name": "postal" } ] }, "algorithms": { "algorithm": [ { "name": "standard-reduction", "function": "standard-reduction" }, { "name": "double-metaphone", "at": "/com.marklogic.smart-mastering/algorithms/double-metaphone.xqy", "function": "double-metaphone" }, { "name": "thesaurus", "at": "/com.marklogic.smart-mastering/algorithms/thesaurus.xqy", "function": "thesaurus" }, { "name": "zip-match", "at": "/com.marklogic.smart-mastering/algorithms/zip.xqy", "function": "zip-match" }, { "name": "customOption", "at": "/directory/customOption.sjs", "function": "customOption" } ] }, "collections": { "content": [ "mdm-content" ] }, "scoring": { "add": [ { "propertyName": "ssn", "weight": 10 }, { "propertyName": "postal", "weight": 5 } ], "expand": [ { "propertyName": "firstName", "algorithmRef": "thesaurus", "weight": 5, "thesaurus": "/directory/thesaurus.xml", "filter": "" }, { "propertyName": "lastName", "algorithmRef": "double-metaphone", "weight": 2, "dictionary": "/directory/dictionary.xml", "distanceThreshold": "30", "collation": "http://marklogic.com/collation/codepoint" }, { "propertyName": "state", "algorithmRef": "customOption", "weight": 1 }, { "propertyName": "postal", "algorithmRef": "zip-match", "zip": [ { "origin": 5, "weight": 3 }, { "origin": 9, "weight": 2 } ] } ], "reduce": [ { "algorithmRef": "standard-reduction", "weight": 4, "allMatch": { "property": [ "lastName", "addr" ] } } ] }, "actions": { "action": [ { "name": "customAction", "at": "/directory/customAction.sjs", "function": "customAction" } ] }, "thresholds": { "threshold": [ { "above": "20", "label": "Definite Match", "action": "merge" }, { "above": "10", "label": "Likely Match", "action": "notify" }, { "above": "7", "label": "Custom Match", "action": "customAction" } ] }, "tuning": { "maxScan": "200" } }, "mergeOptions": { "matchOptions": "matchOptions", "propertyDefs": { "properties": [ { "namespace": "", "localname": "ssn", "name": "ssn" }, { "namespace": "", "localname": "firstName", "name": "firstName" }, { "namespace": "", "localname": "lastName", "name": "lastName" }, { "namespace": "", "localname": "addr", "name": "addr" }, { "namespace": "", "localname": "city", "name": "city" }, { "namespace": "", "localname": "state", "name": "state" }, { "namespace": "", "localname": "postal", "name": "postal" } ], "namespaces": {} }, "algorithms": { "stdAlgorithm": { "namespaces": {}, "timestamp": { "path": "/path/to/timestamp" } }, "custom": [], "collections": { "onMerge": { "remove": { "collection": [ "coll-to-add" ] }, "add": { "collection": [ "coll-to-remove" ] } }, "onNoMatch": { "set": { "collection": [ "coll-to-set" ] } }, "onNotification": { "add": { "collection": [ "coll3", "coll4" ] } }, "onArchive": { "remove": { "collection": [ "arch-coll" ] } } } }, "mergeStrategies": [ { "name": "CRM Source", "algorithmRef": "standard", "sourceWeights": [ { "source": { "name": "CRM", "weight": 3 } }, { "source": { "name": "ERP", "weight": 1 } } ] }, { "name": "Length-Weight", "algorithmRef": "standard", "length": { "weight": 12 } } ], "merging": [ { "propertyName": "ssn", "maxValues": 1, "length": { "weight": 5 } }, { "propertyName": "firstName", "maxValues": 2, "sourceWeights": [ { "source": { "name": "Oracle", "weight": 20 } } ] }, { "propertyName": "state", "strategy": "CRM Source" }, { "propertyName": "postal", "strategy": "Length-Weight" }, { "default": true, "maxValues": 10, "maxSources": 5 } ], "tripleMerge": {} } },'language':'en','version':'1'},
    {'id':'step-4-flow-2','name':'Flow 02 Custom Step','description':'My Step 4 description','type':'custom','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{'custom':'options'},'language':'en','version':'1'},
    {'id':'step-1-flow-3','name':'Flow 3 Ingest Step','description':'My Step 1 description','type':'ingestion','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{'input_file_path':'/marklogic-data-hub/examples/healthcare','input_file_type':'documents','output_collections':'Order,Flow 3 Ingest Step,input,newCollection','output_permissions':'rest-reader,read,rest-writer,update','document_type':'json','transform_module':'/data-hub/5/transforms/mlcp-flow-transform.sjs','transform_namespace':'http://marklogic.com/data-hub/mlcp-flow-transform','transform_param':'entity-name=Order,flow-name=Flow 3 Ingest Step'},'language':'en','version':'1'},
    {'id':'step-2-flow-3','name':'Flow 3 Mapping Step','description':'My Step 2 description','type':'mapping','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{'sourceCollection':'Flow 3 Ingest Step','sourceURI':'source-doc-01.json','sourceQuery':'','targetEntity':'Order','targetEntityType':'http://example.org/Order-0.0.1/Order','sourceContext':'//','properties':{'id':{'sourcedFrom':'id'},'price':{'sourcedFrom':'price'},'products':{'sourcedFrom':'product_id'}}},'language':'en','version':'1'},
    {'id':'step-3-flow-3','name':'Flow 3 Mastering Step','description':'My Step 3 description','type':'mastering','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{ "matchOptions": { "dataFormat": "json", "propertyDefs": { "property": [ { "namespace": "", "localname": "ssn", "name": "ssn" }, { "namespace": "", "localname": "firstName", "name": "firstName" }, { "namespace": "", "localname": "lastName", "name": "lastName" }, { "namespace": "", "localname": "addr", "name": "addr" }, { "namespace": "", "localname": "city", "name": "city" }, { "namespace": "", "localname": "state", "name": "state" }, { "namespace": "", "localname": "postal", "name": "postal" } ] }, "algorithms": { "algorithm": [ { "name": "standard-reduction", "function": "standard-reduction" }, { "name": "double-metaphone", "at": "/com.marklogic.smart-mastering/algorithms/double-metaphone.xqy", "function": "double-metaphone" }, { "name": "thesaurus", "at": "/com.marklogic.smart-mastering/algorithms/thesaurus.xqy", "function": "thesaurus" }, { "name": "zip-match", "at": "/com.marklogic.smart-mastering/algorithms/zip.xqy", "function": "zip-match" }, { "name": "customOption", "at": "/directory/customOption.sjs", "function": "customOption" } ] }, "collections": { "content": [ "mdm-content" ] }, "scoring": { "add": [ { "propertyName": "ssn", "weight": 10 }, { "propertyName": "postal", "weight": 5 } ], "expand": [ { "propertyName": "firstName", "algorithmRef": "thesaurus", "weight": 5, "thesaurus": "/directory/thesaurus.xml", "filter": "" }, { "propertyName": "lastName", "algorithmRef": "double-metaphone", "weight": 2, "dictionary": "/directory/dictionary.xml", "distanceThreshold": "30", "collation": "http://marklogic.com/collation/codepoint" }, { "propertyName": "state", "algorithmRef": "customOption", "weight": 1 }, { "propertyName": "postal", "algorithmRef": "zip-match", "zip": [ { "origin": 5, "weight": 3 }, { "origin": 9, "weight": 2 } ] } ], "reduce": [ { "algorithmRef": "standard-reduction", "weight": 4, "allMatch": { "property": [ "lastName", "addr" ] } } ] }, "actions": { "action": [ { "name": "customAction", "at": "/directory/customAction.sjs", "function": "customAction" } ] }, "thresholds": { "threshold": [ { "above": "20", "label": "Definite Match", "action": "merge" }, { "above": "10", "label": "Likely Match", "action": "notify" }, { "above": "7", "label": "Custom Match", "action": "customAction" } ] }, "tuning": { "maxScan": "200" } }, "mergeOptions": { "matchOptions": "matchOptions", "propertyDefs": { "properties": [ { "namespace": "", "localname": "ssn", "name": "ssn" }, { "namespace": "", "localname": "firstName", "name": "firstName" }, { "namespace": "", "localname": "lastName", "name": "lastName" }, { "namespace": "", "localname": "addr", "name": "addr" }, { "namespace": "", "localname": "city", "name": "city" }, { "namespace": "", "localname": "state", "name": "state" }, { "namespace": "", "localname": "postal", "name": "postal" } ], "namespaces": {} }, "algorithms": { "stdAlgorithm": { "namespaces": {}, "timestamp": { "path": "/path/to/timestamp" } }, "custom": [], "collections": { "onMerge": { "remove": { "collection": [ "coll-to-add" ] }, "add": { "collection": [ "coll-to-remove" ] } }, "onNoMatch": { "set": { "collection": [ "coll-to-set" ] } }, "onNotification": { "add": { "collection": [ "coll3", "coll4" ] } }, "onArchive": { "remove": { "collection": [ "arch-coll" ] } } } }, "mergeStrategies": [ { "name": "CRM Source", "algorithmRef": "standard", "sourceWeights": [ { "source": { "name": "CRM", "weight": 3 } }, { "source": { "name": "ERP", "weight": 1 } } ] }, { "name": "Length-Weight", "algorithmRef": "standard", "length": { "weight": 12 } } ], "merging": [ { "propertyName": "ssn", "maxValues": 1, "length": { "weight": 5 } }, { "propertyName": "firstName", "maxValues": 2, "sourceWeights": [ { "source": { "name": "Oracle", "weight": 20 } } ] }, { "propertyName": "state", "strategy": "CRM Source" }, { "propertyName": "postal", "strategy": "Length-Weight" }, { "default": true, "maxValues": 10, "maxSources": 5 } ], "tripleMerge": {} } },'language':'en','version':'1'},
    {'id':'step-4-flow-3','name':'Flow 3 Custom Step','description':'My Step 4 description','type':'custom','sourceDatabase':'','targetDatabase':'staging','isValid':true,'isRunning':false,'config':{'custom':'options'},'language':'en','version':'1'},
    {'id':'step-1-flow-4','name':'Flow 4 Ingest Step','description':'My Step 1 description','type':'ingestion','sourceDatabase':'','targetDatabase':'staging','isValid':false,'isRunning':false,'config':{'input_file_path':'/marklogic-data-hub/examples/healthcare','input_file_type':'documents','output_collections':'Order,Flow 4 Ingest Step,input,newCollection','output_permissions':'rest-reader,read,rest-writer,update','document_type':'json','transform_module':'/data-hub/5/transforms/mlcp-flow-transform.sjs','transform_namespace':'http://marklogic.com/data-hub/mlcp-flow-transform','transform_param':'entity-name=Order,flow-name=Flow 4 Ingest Step'},'language':'en','version':'1'}
  ],
  'collections': [
    'collection-01',
    'collection-02',
    'collection-03'
  ]
}

/**
 * Generated UUID
 * 
 * ....
 *
 * returns Sting
 **/
exports.uuid = function() {
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

/**
 * Get all data within Collection
 * 
 * ....
 *
 * cName String Name of the collection
 * 
 * returns Array
 **/
exports.getCollection = function(cName) {
  return new Promise(function(resolve, reject) {
    if (collections[cName])
      resolve(collections[cName]);
    else
      reject({ error: `'${cName}' does not exist` });
  });
}

/**
 * Save new/update item to collection
 * 
 * Merges existing object with passed object 
 *
 * cName String Name of the collection
 * id String Id of the item in the collection (updating)
 * obj Object Object to be added to/updated in the collection
 * 
 * returns Object
 **/
exports.save = function(cName, id, obj) {
  return new Promise(function(resolve, reject) {
    if (collections[cName]) {
      let index = _.findIndex(collections[cName], ['id', id]);
      let item = _.find(collections[cName], ['id', id]);
      let data = Object.assign(item || {}, obj);
      if (index !== -1) {
        collections[cName][index] = data;
      } else {
        collections[cName].push(data);
      }
      resolve(data);
    } else {
      reject({ error: `'${cName}' does not exist` });
    }
  });
}

/**
 * Get item from collection
 * 
 * ... 
 *
 * cName String Name of the collection
 * id String Id of the item in the collection (updating)
 * 
 * returns Object
 **/
exports.get = function(cName, id) {
  return new Promise(function(resolve, reject) {
    if (collections[cName]) {
      let item = _.find(collections[cName], ['id', id]);
      if (item) {
        resolve(item);
      } else {
        reject({ error: `'${id}' does not exist` });
      }
    } else {
      reject({ error: `'${cName}' does not exist` });
    }
  });
}


/**
 * Delete item from collection
 * 
 * ... 
 *
 * cName String Name of the collection
 * id String Id of the item in the collection (updating)
 * 
 * returns Object
 **/
exports.delete = function(cName, id) {
  return new Promise(function(resolve, reject) {
    if (collections[cName]) {
      let index = _.findIndex(collections[cName], ['id', id]);
      let item = _.find(collections[cName], ['id', id]);
      if (item) {
        collections[cName].splice(index, 1);
        resolve(item);
      } else {
        reject({ error: `'${id}' does not exist` });
      }
    } else {
      reject({ error: `'${cName}' does not exist` });
    }
  });
}