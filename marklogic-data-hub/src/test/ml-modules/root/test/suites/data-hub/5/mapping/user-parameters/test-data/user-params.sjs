function getParameterDefinitions(mappingStep) {
  return [
    {
      "name": "NAMES",
      "description": "Something goes here"
    },
    {
      "name": "STATUSES"
    }
  ];
}

function getParameterValues(content, stepExecutionContext) {
  return {
    "NAMES": {
      "name1": "Jane",
      "name2": "John"
    },
    "STATUSES": {
      "a": "Active",
      "i": "Inactive"
    }
  };
}

module.exports = {
  getParameterDefinitions,
  getParameterValues
}