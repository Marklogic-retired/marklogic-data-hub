'use strict';
let Storage = require('./StorageService');


/**
 * Get all Collections for a Database
 * ....
 *
 * databaseId String Id of database to get collections from
 * returns List
 **/
exports.getDatabaseCollections = function(databaseId) {
  // ignoring databaseId - it's just a mock
  return Storage.getCollection('collections');
}

