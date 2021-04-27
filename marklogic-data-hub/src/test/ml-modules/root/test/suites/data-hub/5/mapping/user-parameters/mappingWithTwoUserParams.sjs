const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
const test = require("/test/test-helper.xqy");

const assertions = [];

// First, validate that the expected parameter elements are in the XML/XSLT templates
const xmlTemplate = hubTest.getModulesRecord("/steps/mapping/mappingStep1.step.xml").document;
assertions.push(
  test.assertEqual("URI", xmlTemplate.xpath("/*:mapping/*:param[1]/@name/fn:string()")),
  test.assertEqual("NAMES", xmlTemplate.xpath("/*:mapping/*:param[2]/@name/fn:string()")),
  test.assertEqual("STATUSES", xmlTemplate.xpath("/*:mapping/*:param[3]/@name/fn:string()"))
);

const stylesheet = hubTest.getModulesRecord("/steps/mapping/mappingStep1.step.xml.xslt").document;
assertions.push(
  test.assertEqual("URI", stylesheet.xpath("/*:stylesheet/*:param[1]/@name/fn:string()")),
  test.assertEqual("NAMES", stylesheet.xpath("/*:stylesheet/*:param[2]/@name/fn:string()")),
  test.assertEqual("STATUSES", stylesheet.xpath("/*:stylesheet/*:param[3]/@name/fn:string()"))
);


// Test running a step against a document
const response = flowRunner.processContentWithFlow("simpleMappingFlow",
  [{
    "uri": "/inputCustomer.json",
    "value": {
      "customerId": 1,
      "nameKey": "name1",
      "statusKey": "a"
    }
  }],
  sem.uuidString(), {}, ["1"]
);
assertions.push(test.assertEqual('finished', response.jobStatus, "Unexpected response: " + xdmp.toJsonString(response)));

const record = hubTest.getRecord("/inputCustomer.json");
const customer = record.document.envelope.instance.Customer;
assertions.push(
  test.assertEqual("Jane", customer.name, "'name1' should map to Jane"),
  test.assertEqual("Active", customer.status, "'a' should map to Active")
);


// Now test validating and testing a mapping against a persisted document
const mappingStep = hubTest.getRecord("/steps/mapping/mappingStep1.step.json").document;
const testOutput = esMappingLib.validateAndTestMapping(mappingStep, "/content/customer1.json");

assertions.push(
  test.assertEqual("John", testOutput.properties.name.output),
  test.assertEqual("lookup(nameKey, $NAMES)", testOutput.properties.name.sourcedFrom),
  test.assertEqual("Inactive", testOutput.properties.status.output),
  test.assertEqual("lookup(statusKey, $STATUSES)", testOutput.properties.status.sourcedFrom)
);

assertions;
