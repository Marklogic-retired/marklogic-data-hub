/**
 Copyright (c) 2021 MarkLogic Corporation

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

const StepExecutionContext = require("/data-hub/5/flow/stepExecutionContext.sjs");
const test = require("/test/test-helper.xqy");

const fakeFlow = {
  "name": "fakeFlow",
  "steps": {
    "1": {}
  }
};
const stepNumber = "1";
const jobId = "dont-matter";
const stepDef = {};

const assertions = [];
let context;

function verifyBatchOutputIsEnabled(options, message) {
  context = new StepExecutionContext(fakeFlow, stepNumber, stepDef, jobId, options);
  assertions.push(test.assertEqual(true, context.batchOutputIsEnabled(), message));
}

function verifyBatchOutputIsDisabled(options, message) {
  context = new StepExecutionContext(fakeFlow, stepNumber, stepDef, jobId, options);
  assertions.push(test.assertEqual(false, context.batchOutputIsEnabled(), message));
}

verifyBatchOutputIsEnabled({}, "Batch output is enabled by default");

verifyBatchOutputIsEnabled({ "disableJobOutput": false });

verifyBatchOutputIsDisabled({ "disableJobOutput": true }, "When job output is disabled, so is batch output");

verifyBatchOutputIsDisabled({"enableBatchOutput": "never"});

verifyBatchOutputIsDisabled({"enableBatchOutput": "onFailure"}, "Since there are no failed items, batch output is disabled");
context.failedItems = ["test failure"];
assertions.push(test.assertEqual(true, context.batchOutputIsEnabled(), 
  "Since there's now a failed item (even though it's not a real one), batch output is enabled"));

assertions;
