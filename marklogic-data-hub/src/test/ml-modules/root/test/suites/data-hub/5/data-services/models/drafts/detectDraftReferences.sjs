const entityLib = require("/data-hub/5/impl/entity-lib.sjs");
const modelService = require("../../lib/modelService.sjs")
const test = require("/test/test-helper.xqy");

const customerModel = {
  "info": {
    "title": "Customer",
    "version": "0.0.1",
    "baseUri": "http://example.org/"
  },
  "definitions": {
    "Customer": {
      "properties": {
        "customerId": {"datatype": "integer"},
        "age": {"datatype": "integer"},
        "orders": {
          "datatype": "array",
          "items": {
            "$ref": "http://example.org/Order-0.0.1/Order"
          }
        }
      }
    }
  }
};
const orderModel = {
  "info": {
    "title": "Order",
    "version": "0.0.1",
    "baseUri": "http://example.org/"
  },
  "definitions": {
    "Order": {
      "properties": {
        "orderId": {"datatype": "integer"},
        "name": {"datatype": "string"}
      }
    }
  }
};

const customerModelUri = "Customer";
const orderModelUri = "Order";

const assertions = [];

xdmp.invokeFunction(function() {
  declareUpdate();
  entityLib.writeDraftModel(customerModelUri, customerModel);
  entityLib.writeDraftModel(orderModelUri, orderModel);
});


let references = modelService.getModelReferences(orderModelUri);

assertions.push(
  test.assertEqual(1, references.entityNames.length),
  test.assertEqual("Customer", references.entityNames[0])
);

xdmp.invokeFunction(function() {
  declareUpdate();
  entityLib.deleteDraftModel(customerModelUri);
});

references = modelService.getModelReferences(orderModelUri);

assertions.push(
  test.assertEqual(0, references.entityNames.length)
);

assertions;
