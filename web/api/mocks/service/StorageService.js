'use strict';
let Error = require('./ErrorService');

const _ = require('lodash');

let defaultObjects = {
  flows: {'name':'','description':'','batchSize':100,'threadCount':4,'options':{},'steps':[],'jobs':[],'latestJob':null,'isValid':true,'version':1},
  steps: {'name':'','description':'','type':'ingest','sourceDatabase':'staging','targetDatabase':'staging','config':{},'isValid':true,'version':1},
  jobs: {'startTime':'2019-01-31T12:10:00','endTime':null,'output':[],'status':'running','stepRunningPercent':0,'successfulEvents':0,'failedEvents':0}
}

let collections = {
  'flows': require('../data/flows.json'),
  'steps': require('../data/steps.json'),
  'collections': require('../data/collections.json'),
  'jobs': []  // generated on the fly when /flow/{flow id}/run triggered
}

let getDefaultObject = function(type) {
  let defaultObj = defaultObjects[type] || {};
  if (type === 'jobs') {
    defaultObj.startTime = (new Date()).toISOString();
  }
  return defaultObj;
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
      reject(Error.create(404, `Not Found: '${cName}' does not exist`));
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
        // update record and increment version, if Flow or Step
        data.version = (['flows','steps'].includes(cName) && 
                        data.version) ? data.version + 1 : undefined;
        collections[cName][index] = data; 
      } else {
        // new record
        data = Object.assign(getDefaultObject(cName), data);
        collections[cName].push(data); 
      }
      resolve(data);
    } else {
      reject(Error.create(404, `Not Found: '${cName}' does not exist`));
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
        reject(Error.create(404, `Not Found: '${id}' does not exist`));
      }
    } else {
      reject(Error.create(404, `Not Found: '${cName}' does not exist`));
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
        reject(Error.create(404, `Not Found: '${id}' does not exist`));
      }
    } else {
      reject(Error.create(404, `Not Found: '${cName}' does not exist`));
    }
  });
}