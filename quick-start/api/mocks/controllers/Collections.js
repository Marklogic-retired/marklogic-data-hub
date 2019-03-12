'use strict';

var utils = require('../utils/writer.js');
var Collections = require('../service/CollectionsService');

module.exports.getDatabaseCollections = function getDatabaseCollections (req, res, next) {
  var databaseId = req.swagger.params['databaseId'].value;
  Collections.getDatabaseCollections(databaseId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
