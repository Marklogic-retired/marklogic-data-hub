function invoke(module, args) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/step/" + module, args));
}

function saveStep(stepDefinitionType, info) {
  return invoke("saveStep.sjs", {stepDefinitionType, stepProperties: xdmp.toJSON(info), overwrite: false, throwErrorIfStepIsPresent: true});
}

function updateStep(stepDefinitionType, info) {
  return invoke("saveStep.sjs", {stepDefinitionType, stepProperties: xdmp.toJSON(info), overwrite: false, throwErrorIfStepIsPresent: false});
}

function createDefaultMappingStep(name) {
  // Assumes the existence of the Customer entity type; if you don't have it, don't use this function!
  return saveStep("mapping", {
    name: name,
    targetEntityType: "http://example.org/Customer-0.0.1/Customer",
    selectedSource: "collection",
    sourceQuery: "cts.collectionQuery('test')"
  });
}

function createDefaultIngestionStep(name) {
  return saveStep("ingestion", {
    name: name,
    sourceFormat: "json",
    targetFormat: "json",
    targetDatabase: "data-hub-FINAL"
  });
}

function getStep(stepDefinitionType, stepName) {
  return invoke("getStep.sjs", {stepDefinitionType, stepName});
}

function deleteStep(stepDefinitionType, stepName) {
  return invoke("deleteStep.sjs", {stepDefinitionType, stepName});
}

module.exports = {
  createDefaultIngestionStep,
  createDefaultMappingStep,
  getStep,
  deleteStep,
  saveStep,
  updateStep
};
