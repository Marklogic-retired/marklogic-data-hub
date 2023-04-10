'use strict';

import protectedCollections from "/data-hub/features/protected-collections.mjs";
const test = require("/test/test-helper.xqy");


const assertions = [];

//Instance with protected collections
const stepContext1 = {
  "flowStep": {
    "stepDefinitionName": "my-protected",
    "stepDefinitionType": "MAPPING",
    "collections": ["noProtected"],
    "sourceDatabase": "data-hub-FINAL",
    "targetDatabase": "data-hub-FINAL",
    "targetEntityType":"Person",
    "sourceQuery": "cts.collectionQuery('doesnt-matter')",
    "features": {
      "protectedCollections": {
        "enabled": true,
        "collections": ["customerCollection"],
        "permissions": "data-hub-common-reader,read,data-hub-common-writer,update"
      }
    }
  }
};
const modelCustomer = {
  "info": {
    "title": "Customer",
    "version": "0.0.1",
    "baseUri": "http://example.org/"
  },
  "definitions": {
    "Customer": {
      "properties": {
        "customerId": {"datatype": "integer"},
        "name": {"datatype": "string"},
        "status": {"datatype": "string"}
      },
      "features": {
        "protectedCollections": {
          "enabled": true,
          "collections": ["myCustomerCollection"],
          "permissions": "data-hub-common-reader,read,data-hub-common-writer,update"
        }
      }
    }
  }
};
const contentArray1 = [{
  "uri": "my-uri",
  "context": {
    "collections": ["coll1", "coll2"]
  }
}];

const result2 = protectedCollections.onInstanceSave(stepContext1, modelCustomer, contentArray1);

// assert
//assertions.push(test.assertEqual(4, result2.context.collections.length));
//assertions.push(test.assertTrue(result2.context.collections.includes("myCustomerCollection")));

//Instance with protected collections in false
const stepContext2 = {
  "flowStep": {
      "stepDefinitionName": "my-protected",
      "stepDefinitionType": "MAPPING",
      "collections": ["noProtected"],
      "sourceDatabase": "data-hub-FINAL",
      "targetDatabase": "data-hub-FINAL",
      "targetEntityType": "Person",
      "sourceQuery": "cts.collectionQuery('doesnt-matter')",
      "features": {
          "protectedCollections": {
              "enabled": false,
              "collections": ["myCollection"],
              "permissions": "data-hub-common-reader,read,data-hub-common-writer,update"
          }
      }
  }
};
const modelPerson = {
  "info": {
    "title": "Person",
    "version": "0.0.1",
    "baseUri": "http://example.org/"
  },
  "definitions": {
    "Person": {
      "properties": {
        "personId": {"datatype": "integer"},
        "name": {"datatype": "string"},
      },
      "features": [{
        "protectedCollections": {
          "enabled": false
        }
      }]
    }
  }
};

const contentObject2 = [{
  "uri": "my-uri",
  "context": {
    "collections": ["coll1", "coll2"]
  }
}];

//const result3 = protectedCollections.onInstanceSave(stepContext2, modelPerson, contentObject2);
// assert
//assertions.push(test.assertEqual(2, result3.context.collections.length));

assertions;
