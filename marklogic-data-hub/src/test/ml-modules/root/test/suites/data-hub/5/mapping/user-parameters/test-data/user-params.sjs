function getParameterDefinitions(mappingStep) {
  if (!mappingStep) {
    throw Error("A mappingStep should be included when getParameterDefinitions is called as part of validateAndTestMapping");
  }
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

function getParameterValues(contentSequence, mappingStep) {
  if (!mappingStep) {
    throw Error("A mappingStep should be included when getParameterValues is called");
  }

  // Just verifying that we can iterate over the sequence
  for (var ignore of contentSequence) {
  }

  // And verify that it's a sequence, not an array
  // A sequence is expected for consistency with the step main() function, which accepts a sequence when
  // acceptsBatch=true
  contentSequence.toArray();

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
