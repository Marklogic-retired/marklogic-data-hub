function invoke(module, args) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/customStep/" + module, args));
}

function getCustomStep(stepName) {
  return invoke("getCustomStep.sjs", {stepName});
}
function getCustomSteps() {
  return invoke("getCustomSteps.sjs");
}

module.exports = {
  getCustomStep,
  getCustomSteps
};
