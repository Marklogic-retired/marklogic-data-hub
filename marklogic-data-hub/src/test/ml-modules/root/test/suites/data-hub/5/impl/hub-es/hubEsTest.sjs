const test = require("/test/test-helper.xqy");
const lib = require('/data-hub/5/impl/hub-es.sjs');
let result = [];

function testGetPropertyRangePath(entityIRI, propertyPath, expRes) {
  const path = lib.getPropertyRangePath(entityIRI, propertyPath);
  test.assertEqual(expRes, path);
}

result
// getPropertyRangePath for two level nested property
.concat(testGetPropertyRangePath("http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity",
    "numStrEntityProp/numEntProp/intProp",
    "//*:instance/EntitiesSearchEntity/numStrEntityProp/NumStringEntity/numEntProp/NumericEntity/intProp"))
// getPropertyRangePath for one level nested property
.concat(testGetPropertyRangePath("http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity",
    "numStrEntityProp/strCityProp",
    "//*:instance/EntitiesSearchEntity/numStrEntityProp/NumStringEntity/strCityProp"))
// getPropertyRangePath for one level nested property
.concat(testGetPropertyRangePath("http://marklogic.com/EntitiesSearchEntity-0.0.1/NumStringEntity",
    "numEntProp/intProp",
    "//*:instance/NumStringEntity/numEntProp/NumericEntity/intProp"))
// getPropertyRangePath for root level property
.concat(testGetPropertyRangePath("http://marklogic.com/EntitiesSearchEntity-0.0.1/NumStringEntity",
    "intProp", "//*:instance/NumStringEntity/intProp"));


function testRangePathPropertyReferenceType(entityIRI, propertyPath) {
  const refType = lib.getPropertyReferenceType(entityIRI, propertyPath);
  test.assertEqual("path", refType);
}

result
// getPropertyReferenceType for two level nested property
.concat(testRangePathPropertyReferenceType("http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity",
    "numStrEntityProp/numEntProp/intProp"))
// getPropertyReferenceType for one level nested property
.concat(testRangePathPropertyReferenceType("http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity",
    "numStrEntityProp/strCityProp"))
// getPropertyReferenceType for one level nested property
.concat(testRangePathPropertyReferenceType("http://marklogic.com/EntitiesSearchEntity-0.0.1/NumStringEntity",
    "numEntProp/intProp"))
// getPropertyReferenceType for root level nested property
.concat(testRangePathPropertyReferenceType("http://marklogic.com/EntitiesSearchEntity-0.0.1/NumStringEntity",
    "intProp"));

function testRangeElementPropertyReferenceType(entityIRI, propertyPath) {
  const refType = lib.getPropertyReferenceType(entityIRI, propertyPath);
  test.assertEqual("element", refType);
}

result
// getPropertyReferenceType for two level nested property
.concat(testRangeElementPropertyReferenceType("http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity",
    "numStrEntityProp/numEntProp/floatProp"))
// getPropertyReferenceType for one level nested property
.concat(testRangeElementPropertyReferenceType("http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity",
    "numStrEntityProp/strNameProp"))
// getPropertyReferenceType for one level nested property
.concat(testRangeElementPropertyReferenceType("http://marklogic.com/EntitiesSearchEntity-0.0.1/NumStringEntity",
    "numEntProp/floatProp"))
// getPropertyReferenceType for root level nested property
.concat(testRangeElementPropertyReferenceType("http://marklogic.com/EntitiesSearchEntity-0.0.1/NumStringEntity",
    "strNameProp"));

function testGetEntityDefinitionFromIRI(entityIRI, expRes) {
  const result = lib.getEntityDefinitionFromIRI(entityIRI);
  test.assertTrue(result.definitions[expRes] !== null);
}

result
// Exisiting IRI
.concat(testGetEntityDefinitionFromIRI("http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity",
    "EntitiesSearchEntity"))
// fetching nested objectType from IRI
.concat(testGetEntityDefinitionFromIRI("http://marklogic.com/EntitiesSearchEntity-0.0.1/NumStringEntity",
    "NumStringEntity"));
