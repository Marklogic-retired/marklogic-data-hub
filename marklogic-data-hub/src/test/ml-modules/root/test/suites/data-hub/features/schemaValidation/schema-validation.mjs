import schemaValidation from "/data-hub/features/schema-validation.mjs";
const test = require("/test/test-helper.xqy");

schemaValidation.onArtifactSave("model", "Customer");

const assertions = [
test.assertTrue(checkForSchema("/entities/Customer.entity.schema.json"), "TDE should be generated when 'tdeGenerationDisabled' is set to false"),
test.assertTrue(checkForSchema("/entities/Customer.entity.xsd"), "TDE should be generated when 'tdeGenerationDisabled' is set to false")
];

function checkForSchema(uri){
    return fn.head(xdmp.eval(
        `fn.docAvailable('${uri}') `,
        {uri:uri}, {database: xdmp.schemaDatabase()}
    ));
}


assertions;
