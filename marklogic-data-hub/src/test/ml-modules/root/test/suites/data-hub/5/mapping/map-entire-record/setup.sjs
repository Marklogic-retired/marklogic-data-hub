declareUpdate();

const hubTest = require("/test/data-hub-test-helper.sjs");
const hubTestX = require("/test/data-hub-test-helper.xqy");
const test = require("/test/test-helper.xqy");

hubTestX.resetHub();
hubTestX.loadNonEntities(test.__CALLER_FILE__);
hubTest.createSimpleMappingProject( [
  {
    "sourceRecordScope": "entireRecord",
    "properties": {
      "customerId": {"sourcedFrom": "envelope/instance/CustomerID"},
      "name": {"sourcedFrom": "envelope/headers/createdBy"}
    }
  },
  {
    "sourceRecordScope": "entireRecord",
    "namespaces": {
      "entity-services": "http://marklogic.com/entity-services",
      "custOrderInfo": "custOrderInfo"
    },
    "properties":{
      "customerId": {
        "sourcedFrom": "entity-services:envelope/entity-services:instance/custOrderInfo:CustOrders/custOrderInfo:CustomerID"
      },
      "name": {
        "sourcedFrom": "entity-services:envelope/entity-services:headers/createdBy"
      }
    }
  }
]);
