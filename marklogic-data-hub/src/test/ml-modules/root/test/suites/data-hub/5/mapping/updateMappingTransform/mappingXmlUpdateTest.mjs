'use strict';

import config from "/com.marklogic.hub/config.mjs";
const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.xqy");
const assertions = [];

xdmp.eval("declareUpdate(); " +
  "var builder = new NodeBuilder(); " +
  "let node = builder.addText('string').toNode(); " +
  "xdmp.nodeReplace(cts.doc('/entities/Customer.entity.json').xpath('/definitions/Customer/properties/customerId/datatype'), node);",
null,
{"database": xdmp.database(config.FINALDATABASE)}
);

xdmp.eval("declareUpdate(); " +
  "var builder = new NodeBuilder(); " +
  "let node = builder.addText('string').toNode(); " +
  "xdmp.nodeReplace(cts.doc('/entities/Customer.entity.json').xpath('/definitions/Customer/properties/customerId/datatype'), node);",
null,
{"database": xdmp.database(config.STAGINGDATABASE)}
);

hubTest.waitForIndexes();

const datatypeInXmlMapping = xdmp.eval("cts.doc('/steps/mapping/mapCustomers.step.xml').xpath('/*:mapping/*:entity/*:Customer/*:optional/*:customerId/@xsi:type')", null,
  {
    "database": xdmp.modulesDatabase()
  });

const datatypeInXslt = xdmp.eval("cts.doc('/steps/mapping/mapCustomers.step.xml.xslt').xpath('/*:stylesheet/*:template[@name=\"mapping0-Customer\"]/*:Customer/*:variable/*:customerId/@xsi:type')", null,
  {
    "database": xdmp.modulesDatabase()
  });

assertions.push(
  test.assertEqual("xs:string", datatypeInXmlMapping.toString()),
  test.assertEqual("xs:string", datatypeInXslt.toString())
);

assertions;
