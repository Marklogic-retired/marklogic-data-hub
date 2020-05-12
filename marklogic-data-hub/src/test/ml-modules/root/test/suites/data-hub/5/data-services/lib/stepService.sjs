function invoke(module, args) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/step/" + module, args));
}

function createStep(stepDefinitionType, info) {
  return invoke("createStep.sjs", {stepDefinitionType, info: xdmp.toJSON(info)});
}

function createDefaultMappingStep(name) {
  // Assumes the existence of the Customer entity type; if you don't have it, don't use this function!
  let info = {
    name: name,
    targetEntityType: "http://example.org/Customer-0.0.1/Customer",
    selectedSource: "collection",
    sourceQuery: "cts.collectionQuery('test')"
  };
  return createStep("mapping", info);
}

function getStep(stepDefinitionType, stepName) {
  return invoke("getStep.sjs", {stepDefinitionType, stepName});
}

function deleteStep(stepDefinitionType, stepName) {
  return invoke("deleteStep.sjs", {stepDefinitionType, stepName});
}

function updateStep(stepDefinitionType, stepName, propertiesToAssign) {
  return invoke("updateStep.sjs", {stepDefinitionType, stepName, propertiesToAssign: xdmp.toJSON(propertiesToAssign)});
}

module.exports = {
  createStep,
  createDefaultMappingStep,
  getStep,
  deleteStep,
  updateStep
};
