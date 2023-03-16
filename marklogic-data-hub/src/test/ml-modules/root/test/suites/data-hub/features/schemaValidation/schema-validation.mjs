import schemaValidation from "/data-hub/features/schema-validation.mjs";
const test = require("/test/test-helper.xqy");

try{
    schemaValidation.onArtifactSave("model", "Customer");
} catch (error) {
    xdmp.log("Unable to generate schema " +  error.message);
}

const assertions = [
test.assertTrue(checkForSchema("/entities/Customer.entity.schema.json"), "Customer xml schema should exist"),
test.assertTrue(checkForSchema("/entities/Customer.entity.xsd"), "Customer xml schema should exist")
];

function checkForSchema(uri){
    return fn.head(xdmp.eval(
        `fn.docAvailable('${uri}') `,
        {uri:uri}, {database: xdmp.schemaDatabase()}
    ));
}


assertions;
