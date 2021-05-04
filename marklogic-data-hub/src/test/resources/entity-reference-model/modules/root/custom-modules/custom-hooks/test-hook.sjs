declareUpdate();

var uris;
var content;
var options;
var flowName;
var stepNumber;
var step;

if (options.throwErrorForStepNumber === stepNumber) {
  throw Error("Throwing error on purpose for step number: " + stepNumber);
}

// Using an array function to verify that an array is passed to the hook
content.forEach(contentObject => {
  xdmp.documentInsert("/insertedByHook" + contentObject.uri, contentObject.value, contentObject.context.permissions);
});
