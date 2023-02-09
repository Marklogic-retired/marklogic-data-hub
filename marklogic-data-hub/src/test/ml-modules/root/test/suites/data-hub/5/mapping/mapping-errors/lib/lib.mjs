import esMappingLib from "/data-hub/5/builtins/steps/mapping/entity-services/lib.mjs";
import DataHubSingleton from "/data-hub/5/datahub-singleton.mjs";
const datahub = DataHubSingleton.instance();

const content = ['/content/customer.json'].map(uri => {
  return {
    uri: uri,
    value: fn.head(xdmp.unquote('{"customerId": 100, "name": "Cynthia Waters"}'))
  };
});

function runMappingStep(stepName, stepNumber){
  return datahub.flow.runFlow('simpleMappingFlow', 'testJob', content, {outputFormat: 'json', mapping:{name:stepName}}, stepNumber);
}

function validateAndTestMapping(stepName) {
  const mapping = fn.head(cts.doc("/steps/mapping/"+stepName+".step.json")).toObject();
  return esMappingLib.validateAndTestMapping(mapping, "/content/customer.json");
}


export default {
  runMappingStep,
  validateAndTestMapping
}
