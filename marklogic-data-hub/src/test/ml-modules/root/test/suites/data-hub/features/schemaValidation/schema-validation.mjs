import schemaValidation from "/data-hub/features/schema-validation.mjs";
const test = require("/test/test-helper.xqy");
const config = require("/com.marklogic.hub/config.sjs");

const assertions = [];

schemaValidation.onArtifactSave("model", "Customer");

// assert
xdmp.invokeFunction(function() {

    assertions.push(test.assertTrue(fn.head(xdmp.eval(  "fn.docAvailable('/entities/Customer.entity.schema.json') "
        ,  {}, {database: xdmp.schemaDatabase()})), `Customer json schema should exist.`));
    assertions.push(test.assertTrue(fn.head(xdmp.eval(  " fn.docAvailable('/entities/Customer.entity.xsd') "
        ,  {}, {database: xdmp.schemaDatabase()})), `Customer xml schema should exist.`))

},{database: xdmp.database(config.FINALDATABASE)});




assertions;
