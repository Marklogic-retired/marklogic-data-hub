function invoke(module, args) {
  return fn.head(xdmp.invoke("/data-hub/data-services/step/" + module, args));
}

function saveStep(stepDefinitionType, info) {
  return invoke("saveStep.mjs", {stepDefinitionType, stepProperties: xdmp.toJSON(info), overwrite: false, throwErrorIfStepIsPresent: true});
}

function updateStep(stepDefinitionType, info) {
  return invoke("saveStep.mjs", {stepDefinitionType, stepProperties: xdmp.toJSON(info), overwrite: false, throwErrorIfStepIsPresent: false});
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
  return invoke("getStep.mjs", {stepDefinitionType, stepName});
}

function deleteStep(stepDefinitionType, stepName) {
  return invoke("deleteStep.mjs", {stepDefinitionType, stepName});
}

export default {
  createDefaultIngestionStep,
  createDefaultMappingStep,
  getStep,
  deleteStep,
  saveStep,
  updateStep
};
