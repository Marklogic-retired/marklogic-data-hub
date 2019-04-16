'use strict';

var utils = require('../utils/writer.js');
var Jobs = require('../service/JobsService');


module.exports.getJobs = function getJobs (req, res, next) {
  Jobs.getJobs()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response, 400);
    });
};


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

module.exports.deleteJob = function deleteJob (req, res, next) {
  var jobId = req.swagger.params['jobId'].value;
  Jobs.deleteJob(jobId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response, 400);
    });
};
