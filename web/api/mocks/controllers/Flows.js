'use strict';

var utils = require('../utils/writer.js');
var Storage = require('../service/StorageService');
var Flows = require('../service/FlowsService');

module.exports.createFlow = function createFlow (req, res, next) {
  var body = req.swagger.params['body'].value;
  Flows.createFlow(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response, 400);
    });
};

module.exports.deleteFlow = function deleteFlow (req, res, next) {
  var flowId = req.swagger.params['flowId'].value;
  Flows.deleteFlow(flowId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response, 400);
    });
};

module.exports.getFlow = function getFlow (req, res, next) {
  var flowId = req.swagger.params['flowId'].value;
  Flows.getFlow(flowId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response, 400);
    });
};

module.exports.getFlows = function getFlows (req, res, next) {
  Flows.getFlows()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response, 400);
    });
};

module.exports.runFlow = function runFlow (req, res, next) {
  var flowId = req.swagger.params['flowId'].value;
  Flows.runFlow(flowId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response, 400);
    });
};

module.exports.updateFlow = function updateFlow (req, res, next) {
  var flowId = req.swagger.params['flowId'].value;
  var body = req.swagger.params['body'].value;
  Flows.updateFlow(flowId,body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response, 400);
    });
};

module.exports.stopFlow = function stopFlow (req, res, next) {
  var flowId = req.swagger.params['flowId'].value;
  Flows.stopFlow(flowId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response, 400);
    });
};
