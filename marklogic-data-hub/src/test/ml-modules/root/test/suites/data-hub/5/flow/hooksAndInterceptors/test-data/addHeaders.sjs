var contentArray;
var options;
var stepExecutionContext;

var headerNameToAdd;
var headerValueToAdd;

contentArray.forEach(content => {
  const contentValue = content.value.toObject();
  contentValue.envelope.headers[headerNameToAdd] = headerValueToAdd;

  // For a beforeMain interceptor, content.value must be set to a document node, as a step's main function expects 
  // this to be the case
  content.value = xdmp.toJSON(contentValue);
});

if (stepExecutionContext.flowExecutionContext.addedByBeforeMain !== true) {
  throw Error("Expected addedByBeforeMain=true to have been set in the flowExecutionContext by the beforeMain.sjs interceptor");
}