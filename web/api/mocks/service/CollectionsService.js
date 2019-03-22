'use strict';
let Storage = require('./StorageService');
let Error = require('./ErrorService');


/**
 * Get all Collections for a Database
 * ....
 *
 * databaseId String Id of database to get collections from
 * returns List
 **/
exports.getDatabaseCollections = function(databaseId) {
  let resp;
  if (databaseId) {
    resp = Storage.getCollection('collections');
  } else {
    resp = new Promise((resolve, reject) => {
      reject(Error.create(400, `Bad Request: 'databaseId' required`));
    });
  }
  return resp;

}

