/* global xdmp cts fn */

declareUpdate();
const dtu = require('/test/lib/dhfTestUtils.sjs');
const test = require("/test/test-helper.xqy");

const dataUriPrefix = "/test-data/employee-test/"
const collections = ["testdata","Employee"];

// inserts the sample data.
// note that you can insert this using mlcp if it is more appropriate
function loadEmployeeTestData() {
  xdmp.documentInsert(
    dataUriPrefix + "32920.json",
    {
      "id": "32920",
      "firstName": "Rosanne",
      "lastName": "Henckle",
      "dateOfBirth": "05/19/1979",
      "hireDate": "12/19/2005",
      "salaryHistory": [
        {
          "effectiveDate": "12/23/2005",
          "salary": 63439
        },
        {
          "effectiveDate": "01/14/2010",
          "salary": 66300
        }
      ]
    },
    {
     "collections":collections
   });

   xdmp.documentInsert(
    dataUriPrefix + "34324.json",
    {
      "id": "34324",
      "firstName": "Robert",
      "lastName": "Smith",
      "dateOfBirth": "01/01/1981",
      "hireDate": "12/19/2005",
      "salaryHistory": [
        {
          "effectiveDate": "12/21/2005",
          "salary": 59832
        },
        {
          "effectiveDate": "05/14/2009",
          "salary": 60832
        }
      ]
    },
    {
     "collections":collections
   });
}

//insert data on staging
dtu.mlExecuteUpdateOnStaging(loadEmployeeTestData)

test.log("EmployeeTest Setup COMPLETE....");