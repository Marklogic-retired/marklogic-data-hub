import docPermissions from "/data-hub/features/doc-permissions.mjs";
const test = require("/test/test-helper.xqy");

//assert
const assertions = [];

//Instance with doc permission
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
            "docPermission": {
                "enabled": false,
                "permissions": "data-hub-common-writer,update"
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
                "docPermission": {
                    "enabled": true,
                    "permissions": "data-hub-common-writer,update"
                }
            }
        }
    }
};
const contentArray1 = [{
    "uri": "my-uri",
    "context": {
        "permissions": [xdmp.permission("data-hub-common", "read")]
    }
}];


const result1 = docPermissions.onInstanceSave(stepContext1, modelCustomer, contentArray1);

// assert
assertions.push(test.assertEqual(2, result1[0].context.permissions.length));

//Instance with doc permission
const stepContext2 = {
    "flowStep": {
        "stepDefinitionName": "my-protected",
        "stepDefinitionType": "MAPPING",
        "collections": ["noProtected"],
        "sourceDatabase": "data-hub-FINAL",
        "targetDatabase": "data-hub-FINAL",
        "targetEntityType":"Person",
        "sourceQuery": "cts.collectionQuery('doesnt-matter')",
        "features": {
            "docPermission": {
                "enabled": false,
                "permissions": "data-hub-common-writer,update"
            }
        }
    }
};
const modelCustomer2 = {
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
                "docPermission": {
                    "enabled": false,
                    "permissions": "data-hub-common-writer,update"
                }
            }
        }
    }
};
const contentArray2 = [{
    "uri": "my-uri",
    "context": {
        "permissions": [xdmp.permission("data-hub-common", "read")]
    }
}];


const result2 = docPermissions.onInstanceSave(stepContext2, modelCustomer2, contentArray2);

// assert
assertions.push(test.assertEqual(1, result2[0].context.permissions.length));


assertions;
