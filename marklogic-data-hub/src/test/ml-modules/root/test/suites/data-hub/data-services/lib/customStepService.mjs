function invoke(module, args) {
  return fn.head(xdmp.invoke("/data-hub/data-services/customStep/" + module, args));
}

function getCustomStep(stepName) {
  return invoke("getCustomStep.mjs", {stepName});
}
function getCustomSteps() {
  return invoke("getCustomSteps.mjs");
}

export default {
  getCustomStep,
  getCustomSteps
};
