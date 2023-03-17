import schemaValidation from "/data-hub/features/schema-validation.mjs";
const test = require("/test/test-helper.xqy");
const config = require("/com.marklogic.hub/config.sjs");

schemaValidation.onArtifactSave("model", "Customer");

// assert
const assertions = [
test.assertTrue(checkForSchema("/entities/Customer.entity.schema.json"), "Customer json schema should exist"),
test.assertTrue(checkForSchema("/entities/Customer.entity.xsd"), "Customer xml schema should exist")
];

function checkForSchema(uri){
    return fn.head(xdmp.eval(
        `fn.docAvailable('${uri}') `,
        {uri:uri}, {database: xdmp.schemaDatabase()}
    ));
}

assertions;
