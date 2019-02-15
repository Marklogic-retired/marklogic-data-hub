/* global xdmp cts fn xs sem */

const test = require('/test/test-helper.xqy');
const dtu = require('/test/lib/dhfTestUtils.sjs');
const moment = require("/lib/moment.js")

const dataUriPrefix = "/test-data/employee-test/"
const entityName = "Employee"
const harmonizeFlowName = "sampleHarmonize"
const options = {"entity":entityName,"dhf.collection":"testdata"}

function testHarmonize() {
  //runs the data flow
  const results = dtu.mlHubRunFlow(entityName,harmonizeFlowName,options)
  //the results format is as per below - 
  /* {
    *    "totalCount": 1, 
    *    "errorCount": 0, 
    *    "completedItems": [
    *       "/test-data/employee-test/32920.json"
    *    ], 
    *    "failedItems": [], 
    *    "errors": []
    * }
    */
   if (results.errorCount>0) {
     // optionally log error (if it is not expected)
    console.error(`Error running entityName:${entityName} harmonizeFlowName:${harmonizeFlowName}\n` + JSON.stringify(results,null,2))
   }

  //test result of harmonize job
  let testResults =  [
    test.assertEqual(2, results.totalCount),
    test.assertEqual(0, results.errorCount)
  ]
  
  let completedItems = results.completedItems.map(s=>String(s)) //map xs.string to javascript String
  
  //list of uri's to test
  let expectedUris = [dataUriPrefix + "32920.json",dataUriPrefix + "34324.json"]

  //test each uri
  expectedUris.forEach(uri => {
    let isContainsUri = completedItems.indexOf(uri)>=0
    
    //verify that uri exists in results
    testResults.push(test.assertTrue(isContainsUri,"Results do no contain uri " + uri))
    
    if (isContainsUri) {
      //perform detailed tests against instance
      testResults.push(testEmployeeInstance(uri))
    }
  });


  return testResults;

};

function testEmployeeInstance(uri) {
  const doc = dtu.mlGetDocOnFinal(uri)
  let testResults = []
  //verify that document exists in final db
  testResults.push(test.assertTrue(doc!=null,"Document not found in final db at uri " + uri))

  if (doc!=null) {
    const instance = doc.root.envelope.instance.Employee.toObject()
    const stagingDoc = dtu.mlGetDocOnStaging(uri).root.toObject()
    
    //convert the salaryHistory effectiveDate's to moment types
    let dataWithConvertedDate = stagingDoc["salaryHistory"].map(e=>{
      e.effectiveDate = moment(e.effectiveDate, "MM/DD/YYYY")
      return e
    })
    //find the latest salary data
    const maxDateSalary = dataWithConvertedDate.reduce(function(prev, current) {
        return (prev.effectiveDate.isAfter(current.effectiveDate)) ? prev : current
    })

    //convert "MM/DD/YYYY" string to "YYYY-MM-DD" string
    let stagingHireDate = moment(stagingDoc['hireDate'], "MM/DD/YYYY").format("YYYY-MM-DD") 
    //convert xs.date to "YYYY-MM-DD" string
    let finalHireDate = instance.HireDate ? moment(instance.HireDate.toString(), "YYYY-MM-DD").format("YYYY-MM-DD") :null 
    
    //test mapping
    testResults.concat([
      test.assertEqual(String(stagingDoc['id']), String(instance.ID)),
      test.assertEqual(stagingHireDate, finalHireDate),
      test.assertEqual(maxDateSalary.salary, instance.Salary)
    ])
  }
  return testResults;
};

[].concat(
  testHarmonize()
);