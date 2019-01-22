'use strict'
const moment = require("/lib/moment.js")

/*
* Create Content Plugin
*
* @param id         - the identifier returned by the collector
* @param options    - an object containing options. Options are sent from Java
*
* @return - your content
*/
function createContent(id, options) {
  let doc = cts.doc(id);

  return extractInstanceEmployee(doc.root.toObject());
}
  
/**
* Creates an object instance from some source document.
* @example Expected object format - 
* {
*  "id": "34324",
*  "firstName": "Robert",
*  "lastName": "Smith",
*  "dateOfBirth": "01/01/1981",
*  "hireDate": "12/19/2005",
*  "salaryHistory": [
*    {
*    "effectiveDate": "12/21/2005",
*      "salary": 59832
*    },
*    {
*      "effectiveDate": "05/14/2009",
*      "salary": 60832
*    }
*  ]
* }
*
* @param source  An object containing Employee source data
* @return An object with extracted data and
*   metadata about the instance.
*/
function extractInstanceEmployee(source) {
  //convert the salaryHistory effectiveDate's to moment types
  let dataWithConvertedDate = source["salaryHistory"].map(e=>{
    e.effectiveDate = moment(e.effectiveDate, "MM/DD/YYYY")
    return e
  })
  
  //find the latest salary data
  const maxDateSalary = dataWithConvertedDate.reduce(function(prev, current) {
      return (prev.effectiveDate.isAfter(current.effectiveDate)) ? prev : current
  })

  // return the instance object
  return {
    '$type': 'Employee',
    '$version': '0.0.1',
    'ID': source['id'],
    'HireDate':xs.date(moment(source['hireDate'], "MM/DD/YYYY").toDate()),
    'Salary': maxDateSalary.salary
  }
};


module.exports = {
  createContent: createContent
};

