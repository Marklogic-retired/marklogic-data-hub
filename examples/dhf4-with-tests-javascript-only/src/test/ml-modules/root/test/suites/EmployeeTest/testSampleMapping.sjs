/* global xdmp cts fn xs sem */

const test = require('/test/test-helper.xqy');
const dtu = require('/test/lib/dhfTestUtils.sjs');

const dataUriPrefix = "/test-data/employee-test/"
const entityName = "Employee"
const harmonizeFlowName = "sampleHarmonize"

function testMapping() {  
  //call content.sjs->createContent function against sample data that was created in setup.sjs
  const content = dtu.mlHubHarmonizeCreateContent(entityName,harmonizeFlowName,dataUriPrefix + "32920.json")

  let hireDate = content.HireDate ? content.HireDate.toString() : null

  let testResults =  [
    test.assertEqual("32920", content.ID),
    test.assertEqual("2005-12-19", hireDate),
    test.assertEqual(66300, content.Salary)
  ]
  
  return testResults;
};


[].concat(
  testMapping()
);