'use strict';

const StepRunner = require("/data-hub/5/impl/step-runner.sjs");

var endpointState;
if (!endpointState) {
  endpointState = {};
} else {
  endpointState = fn.head(xdmp.fromJSON(endpointState));
}

new StepRunner().runSteps(
  fn.head(xdmp.fromJSON(workUnit)),
  endpointState
);
