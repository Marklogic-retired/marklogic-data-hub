'use strict';
/* perform merge to create property history */
import Artifacts from "/data-hub/5/artifacts/core.mjs";
import manualMerge from "/data-hub/5/builtins/steps/mastering/default/manual-merge.mjs";
import DataHubSingleton from "/data-hub/5/datahub-singleton.mjs";
import hubUtils from  "/data-hub/5/impl/hub-utils.mjs";

const datahub = DataHubSingleton.instance({});

xdmp.invokeFunction(() => {
  let flow = Artifacts.getFullFlow("CurateCustomerJSON", "2");
  let stepRef = flow.steps["2"];
  let stepDetails = datahub.flow.stepDefinition.getStepDefinitionByNameAndType(stepRef.stepDefinitionName, stepRef.stepDefinitionType) || {};
  let combinedOptions = Object.assign({
    acceptsBatch: true,
    fullOutput: true,
    writeStepOutput: false
  }, stepRef.options, stepDetails.options);
  let query = cts.documentQuery(['/content/customer1.json', '/content/customer2.json']);
  let content = hubUtils.queryToContentDescriptorArray(query, {
    fullOutput: true,
    writeStepOutput: false
  }, xdmp.databaseName(xdmp.database()));
  let results = manualMerge.main(content, combinedOptions);
  hubUtils.normalizeToArray(results).forEach((doc) => {
    xdmp.documentInsert(doc.uri, doc.value, {
      collections: doc.context.collections,
      permissions: doc.context.permissions
    });
  });
}, { update: "true"});