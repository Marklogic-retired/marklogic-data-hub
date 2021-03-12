function invoke(module, args) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/flow/" + module, args));
}

function addStepToFlow(flowName, stepDefinitionType, stepName) {
  return invoke("addStepToFlow.sjs", {flowName, stepDefinitionType, stepName});
}

function deleteFlow(name) {
  return invoke("deleteFlow.sjs", {name});
}

function createFlow(name, description) {
  return invoke("createFlow.sjs", {name, description});
}

function getFlow(name) {
  return invoke("getFlow.sjs", {name});
}

function getFlowsWithStepDetails() {
  return invoke("getFlowsWithStepDetails.sjs", {});
}

function getFlowWithLatestJobInfo(name) {
  return invoke("getFlowWithLatestJobInfo.sjs", {name});
}

function getFullFlow(flowName) {
  return invoke("getFullFlow.sjs", {flowName});
}

function removeStepFromFlow(flowName, stepNumber) {
  return invoke("removeStepFromFlow.sjs", {flowName, stepNumber});
}

function updateFlow(updatedFlow) {
  return invoke("updateFlow.sjs", {updatedFlow});
}

module.exports = {
  addStepToFlow,
  createFlow,
  deleteFlow,
  getFlow,
  getFlowsWithStepDetails,
  getFullFlow,
  removeStepFromFlow,
  updateFlow,
  getFlowWithLatestJobInfo
};
