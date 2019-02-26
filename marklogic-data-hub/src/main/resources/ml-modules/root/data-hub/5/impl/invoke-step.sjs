'use strict';

var globalContext, uris, content, combinedOptions, flowName, stepNumber, step;

const Flow = require("/data-hub/5/impl/flow.sjs");

let flow = new Flow(globalContext);

flow.runStep(uris, content, combinedOptions, flowName, stepNumber, step);
