'use strict';

var utils = require('../utils/writer.js');
var Jobs = require('../service/JobsService');

module.exports.getJob = function getJob (req, res, next) {
  var jobId = req.swagger.params['jobId'].value;
  Jobs.getJob(jobId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response, 400);
    });
};
