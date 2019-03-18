
module.exports = {
  // Maps the internal implementation to a public name.
  customFunction: customFunction,
  setupFunction: setupFunction
};

// "Protected" function not accessible outside of the current module.
function customFunction() {
  // Do something…
}

// "Protected" function not accessible outside of the current module.
function setupFunction($reference, $options, $options) {
  return $options;
}

customFunction.$annotations = { "mdm:setup": { function: 'setupFunction' } };
