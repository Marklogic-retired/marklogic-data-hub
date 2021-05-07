var contentArray;
var options;
var stepExecutionContext;

// This demonstrates an undocumented (as of 5.5) technique by which DHF will pass the stepExecutionContext 
// to an interceptor. An interceptor can then modify the flowExecutionContext, thereby allowing future 
// steps to see those modifications. This is then a way for state to be passed to a future step without 
// passing it via the output content array of a step.
// The reason this is not documented in 5.5 is because the StepExecutionContext class is not yet part of the 
// public DHF API.
stepExecutionContext.flowExecutionContext.addedByBeforeMain = true;
