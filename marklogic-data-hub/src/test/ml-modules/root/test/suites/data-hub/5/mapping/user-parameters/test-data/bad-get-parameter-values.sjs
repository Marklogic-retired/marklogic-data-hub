function getParameterDefinitions(mappingStep) {
  return [
    {
      "name": "TEST"
    }
  ];
}

function getParameterValues(contentSequence) {
  throw Error("Throwing error on purpose");
}

module.exports = {
  getParameterDefinitions,
  getParameterValues
}
