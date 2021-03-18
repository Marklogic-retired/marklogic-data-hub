const test = require("/test/test-helper.xqy");
const flowUtils = require("/data-hub/5/impl/flow-utils.sjs");

function make(flow, stepDefOptions, stepNumber, runtimeOptions) {
  return flowUtils.makeCombinedOptions(flow, {"options": stepDefOptions}, stepNumber, runtimeOptions);
}

function flowOverridesStepDef() {
  const result = make({ "options": {"winner": "flow" }}, { "winner": "stepDef" }, null, null);
  return [
    test.assertEqual("flow", result.winner, "flow takes precedence over step def")
  ];
}

function stepOverridesFlow() {
  const step = {"options": {"winner": "step"}};
  const flow = {"options": {"winner": "flow"}, "steps": {"1": step}};
  const result = make(flow, { "winner": "stepDef" }, "1", null);
  return [
    test.assertEqual("step", result.winner, "step takes precedence over step def")
  ];
}

function runtimeOverridesStep() {
  const runtime = {"winner": "runtime"};
  const step = {"options": {"winner": "step"}};
  const flow = {"options": {"winner": "flow"}, "steps": {"1": step}};
  const result = make(flow, { "winner": "stepDef" }, "1", runtime);
  return [
    test.assertEqual("runtime", result.winner, "runtime takes precedence over step")
  ];
}

function stepSpecificOverridesRuntime() {
  const runtime = {
    "winner": "runtime",
    "stepOptions": {
      "1": {
        "winner": "stepSpecific1"
      }, 
      "2": {
        "winner": "stepSpecific2"
      }
    }
  };
  const step = {"options": {"winner": "step"}};
  const flow = {"options": {"winner": "flow"}, "steps": {"1": step}};
  const result = make(flow, { "winner": "stepDef" }, "1", runtime);
  return [
    test.assertEqual("stepSpecific1", result.winner, "stepOptions takes precedence over everything")
  ];
}

[]
  .concat(flowOverridesStepDef())
  .concat(stepOverridesFlow())
  .concat(runtimeOverridesStep())