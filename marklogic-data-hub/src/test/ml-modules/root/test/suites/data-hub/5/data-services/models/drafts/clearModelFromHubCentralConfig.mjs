import config from "/com.marklogic.hub/config.mjs";
import entityLib from "/data-hub/5/impl/entity-lib.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";
const test = require("/test/test-helper.xqy");

const hubCentralConfig = {
  "modeling": {
    "entities": {
      "Customer": { x: 10, y: 15 },
      "Test": { x: 10, y: 15 }
    }
  }
};

const model = {
  "info": {
    "title": "Customer",
    "version": "0.0.1",
    "baseUri": "http://example.org/"
  },
  "definitions": {
    "Customer": {
      "properties": {
        "customerId": {"datatype": "integer"},
        "age": {"datatype": "integer"}
      }
    }
  }
};

const modelUri = "Customer";

const assertions = [];

xdmp.invokeFunction(function() {
  declareUpdate();
  entityLib.writeDraftModel(modelUri, model);
  hubUtils.writeDocument("/config/hubCentral.json", hubCentralConfig, [xdmp.permission("data-hub-common", "read"),xdmp.permission("data-hub-common-writer", "update")], [], config.FINALDATABASE);
});

xdmp.invokeFunction(function() {
  const hubCentralConfig = cts.doc("/config/hubCentral.json")
  const draftModel = entityLib.findDraftModelByEntityName(modelUri)
  assertions.push(test.assertTrue(fn.exists(hubCentralConfig.xpath("/modeling/entities/Customer"))))
  assertions.push(test.assertEqual(draftModel.info.title, modelUri))
  assertions.push(test.assertTrue(draftModel.info.isDraft))
  assertions.push(test.assertFalse(draftModel.info.isDraftDeleted))
  assertions.push(test.assertEqual("integer", draftModel.definitions[modelUri].properties["age"].datatype))
});

xdmp.invokeFunction(function() {
  declareUpdate();
  entityLib.deleteDraftModel(modelUri)

  const deletedModel = entityLib.findDraftModelByEntityName(modelUri)
  assertions.push(test.assertEqual(deletedModel.info.title, modelUri))
  assertions.push(test.assertTrue(deletedModel.info.isDraft))
  assertions.push(test.assertTrue(deletedModel.info.isDraftDeleted))
});

xdmp.invokeFunction(function() {
  declareUpdate();
  entityLib.publishDraftModels()
});

xdmp.invokeFunction(function() {
  const hubCentralConfig = cts.doc("/config/hubCentral.json")
  assertions.push(test.assertTrue(fn.empty(hubCentralConfig.xpath("/modeling/entities/Customer"))))
  assertions.push(test.assertTrue(fn.exists(hubCentralConfig.xpath("/modeling/entities/Test"))))
});

assertions;
