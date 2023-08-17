'use strict';

import protectedCollections from "/data-hub/features/protected-collections.mjs";
import hubTest from "/test/data-hub-test-helper.mjs";
const test = require("/test/test-helper.xqy");


const assertions = [];

//Instance with protected collections
const stepContext1 = {
  "flowStep": {
    "stepDefinitionName": "my-protected",
    "stepDefinitionType": "MAPPING",
    "collections": ["noProtected"],
    "options": {
      "sourceDatabase": "data-hub-FINAL",
      "targetDatabase": "data-hub-FINAL",
    },
    "targetEntityType":"Person",
    "sourceQuery": "cts.collectionQuery('doesnt-matter')"
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
          "permissions": "data-hub-common,read,data-hub-common-writer,update"
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

let result1 = protectedCollections.onInstanceSave(stepContext1, modelCustomer, contentArray1)[0];

hubTest.runWithRolesAndPrivileges(['data-hub-developer'], ['http://marklogic.com/xdmp/privileges/unprotect-collection'], function () {
  const protectedCollection = xdmp.invokeFunction(() => {
    const sec = require("/MarkLogic/security.xqy");
    let collectionDetails = sec.getCollection("myCustomerCollection")
    return collectionDetails.xpath("/*:collection/*:uri/text()").toString();
  }, {database: xdmp.securityDatabase(xdmp.database("data-hub-FINAL"))});
  assertions.push(test.assertEqual("myCustomerCollection", protectedCollection));
});

assertions.push(test.assertEqual(3, result1.context.collections.length));
assertions.push(test.assertTrue(result1.context.collections.includes("myCustomerCollection")));

//Instance with protected collections in false
const stepContext2 = {
  "flowStep": {
      "stepDefinitionName": "my-protected",
      "stepDefinitionType": "MAPPING",
      "collections": ["noProtected"],
      "sourceDatabase": "data-hub-FINAL",
      "targetDatabase": "data-hub-FINAL",
      "targetEntityType": "Person",
      "sourceQuery": "cts.collectionQuery('doesnt-matter')"
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

const result2 = protectedCollections.onInstanceSave(stepContext2, modelPerson, contentObject2)[0];
assertions.push(test.assertEqual(2, result2.context.collections.length));

assertions;
