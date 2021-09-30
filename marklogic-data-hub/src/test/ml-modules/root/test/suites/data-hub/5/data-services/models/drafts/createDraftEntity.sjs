const entityLib = require("/data-hub/5/impl/entity-lib.sjs");
const test = require("/test/test-helper.xqy");

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
});

xdmp.invokeFunction(function() {
  const draftModel = entityLib.findDraftModelByEntityName(modelUri)
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

const newModel = {
  "info": {
    "title": "Customer",
    "version": "0.0.1",
    "baseUri": "http://example.org/"
  },
  "definitions": {
    "Customer": {
      "properties": {
        "customerId": {"datatype": "integer"},
        "fullname": {"datatype": "string"}
      }
    }
  }
};


xdmp.invokeFunction(function() {
  declareUpdate();
  entityLib.writeDraftModel(modelUri, newModel);
});


xdmp.invokeFunction(function() {
  const newDraft = entityLib.findDraftModelByEntityName(modelUri)
  assertions.push(test.assertFalse(newDraft.info.isDraft))
  assertions.push(test.assertFalse(newDraft.info.isDraftDeleted))
  assertions.push(test.assertEqual("string", newDraft.definitions[modelUri].properties["fullname"].datatype))
  assertions.push(test.assertEqual(null, newDraft.definitions[modelUri].properties["age"]))
});

assertions;
