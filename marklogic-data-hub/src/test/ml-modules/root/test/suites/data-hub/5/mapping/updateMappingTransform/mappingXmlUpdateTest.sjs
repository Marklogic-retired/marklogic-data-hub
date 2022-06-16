'use strict';

const config = require("/com.marklogic.hub/config.sjs");
const test = require("/test/test-helper.xqy");
const assertions = []

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

xdmp.sleep(1000);

const datatypeInXmlMapping = xdmp.eval("cts.doc('/steps/mapping/mapCustomers.step.xml').xpath('/*:mapping/*:entity/*:Customer/*:optional/*:customerId/@xsi:type')", null,
  {
    "database" : xdmp.modulesDatabase()
  });

const datatypeInXslt = xdmp.eval("cts.doc('/steps/mapping/mapCustomers.step.xml.xslt').xpath('/*:stylesheet/*:template[@name=\"mapping0-Customer\"]/*:Customer/*:variable/*:customerId/@xsi:type')", null,
  {
    "database" : xdmp.modulesDatabase()
  })

assertions.push(
  test.assertEqual("xs:string", datatypeInXmlMapping.toString()),
  test.assertEqual("xs:string", datatypeInXslt.toString())
)

assertions;
