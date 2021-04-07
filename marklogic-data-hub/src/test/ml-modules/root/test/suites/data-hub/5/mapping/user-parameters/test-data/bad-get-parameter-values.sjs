function getParameterDefinitions(mappingStep) {
  return [
    {
      "name": "TEST"
    }
  ];
}

function getParameterValues(content, stepExecutionContext) {
  throw Error("Throwing error on purpose");
}

module.exports = {
  getParameterDefinitions,
  getParameterValues
}