import hubUtils from "/data-hub/5/impl/hub-utils.mjs";
import config from "/com.marklogic.hub/config.mjs";
import hubTest from "/test/data-hub-test-helper.mjs";
const test = require("/test/test-helper.xqy");

const testEntityModel = {
    "info": {
        "title": "Customer",
        "version": "0.0.1",
        "description": "A customer",
        "baseUri": "http://marklogic.com/data-hub/example/"
    },
    "definitions": {
        "Customer": {
            "primaryKey": "id",
            "required": [],
            "properties": {
                "id": {
                    "datatype": "string",
                    "collation": "http://marklogic.com/collation/codepoint"
                }
            }
        }
    }
};

const testEntityInstance = {
    "envelope": {
        "instance": {
            "id": "100"
        },
        "attachments": null
    }
};

const validMapping  = {
    "targetEntityType": "http://marklogic.com/data-hub/example/Customer-0.0.1/Customer",
    "properties": {
        "id": {
            "sourcedFrom": "concat(id, 'A')"
        }
    }
};

const invalidMapping = {
    "targetEntityType": "http://marklogic.com/data-hub/example/Customer-0.0.1/Customer",
    "properties": {
        "id": {
            "sourcedFrom": "concat(id, ')"
        }
    }
}

function invokeService(jsonMapping, uri, database) {
    return fn.head(hubTest.runWithRolesAndPrivileges(['hub-central-mapping-reader'], [],
        "/data-hub/data-services/mapping/testMapping.mjs",
        {uri, database, jsonMapping: xdmp.toJSON(jsonMapping)}
    ));
}

function testMappings() {
  const perms = [xdmp.permission("data-hub-common", "read"), xdmp.permission("data-hub-operator", "read"), xdmp.permission("data-hub-operator", "update")];

    hubUtils.writeDocument("/test/entities/Customer.entity.json", testEntityModel , perms, ['http://marklogic.com/entity-services/models'], config.FINALDATABASE);
    hubUtils.writeDocument("/test/customer100.json", testEntityInstance , perms, ['Customer'], config.FINALDATABASE);

    const result =  invokeService(validMapping,'/test/customer100.json', 'data-hub-FINAL');
    const errorResult = invokeService(invalidMapping,'/test/customer100.json', 'data-hub-FINAL');

    return [
        test.assertEqual("concat(id, 'A')", result.properties.id.sourcedFrom),
        test.assertEqual("100A", result.properties.id.output),
        test.assertEqual("concat(id, ')", errorResult.properties.id.sourcedFrom),
        test.assertEqual("Invalid XPath expression: 'concat(id, ')'. Cause: Unexpected character.", errorResult.properties.id.errorMessage)
    ];
}

function clean() {
    xdmp.invokeFunction(() => {
        hubUtils.deleteDocument("/test/customer100.json", config.FINALDATABASE);
        hubUtils.deleteDocument("/test/entities/Customer.entity.json", config.FINALDATABASE);
    }, {update: "true"});
}

[]
    .concat(testMappings())
    .concat(clean())
