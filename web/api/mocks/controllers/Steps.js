'use strict';

var utils = require('../utils/writer.js');
var Steps = require('../service/StepsService');

module.exports.createFlowStep = function createFlowStep (req, res, next) {
  var flowId = req.swagger.params['flowId'].value;
  var stepOrder = req.swagger.params['stepOrder'].value;
  var body = req.swagger.params['body'].value;
  Steps.createFlowStep(flowId,stepOrder,body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response, 400);
    });
};

module.exports.deleteFlowStep = function deleteFlowStep (req, res, next) {
  var flowId = req.swagger.params['flowId'].value;
  var stepId = req.swagger.params['stepId'].value;
  Steps.deleteFlowStep(flowId,stepId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response, 400);
    });
};

module.exports.getFlowSteps = function getFlowSteps (req, res, next) {
  var flowId = req.swagger.params['flowId'].value;
  Steps.getFlowSteps(flowId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response, 400);
    });
};

module.exports.updateFlowStep = function updateFlowStep (req, res, next) {
  var flowId = req.swagger.params['flowId'].value;
  var stepId = req.swagger.params['stepId'].value;
  var body = req.swagger.params['body'].value;
  Steps.updateFlowStep(flowId,stepId,body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response, 400);
    });
};
