const test = require("/test/test-helper.xqy");
const lib = require('/data-hub/5/impl/hub-es.sjs');
let result = [];

function testGetPropertyRangePath(entityIRI, propertyPath, expRes) {
  const path = lib.getPropertyRangePath(entityIRI, propertyPath);
  return [test.assertEqual(expRes, path)];
}

result = result
// getPropertyRangePath for two level nested property
.concat(testGetPropertyRangePath("http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity",
    "numStrEntityProp/numEntProp/intProp",
    "/(es:envelope|envelope)/(es:instance|instance)/EntitiesSearchEntity/numStrEntityProp/NumStringEntity/numEntProp/NumericEntity/intProp"))
// getPropertyRangePath for one level nested property
.concat(testGetPropertyRangePath("http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity",
    "numStrEntityProp/strCityProp",
    "/(es:envelope|envelope)/(es:instance|instance)/EntitiesSearchEntity/numStrEntityProp/NumStringEntity/strCityProp"))
// getPropertyRangePath for one level nested property
.concat(testGetPropertyRangePath("http://marklogic.com/EntitiesSearchEntity-0.0.1/NumStringEntity",
    "numEntProp/intProp",
    "/(es:envelope|envelope)/(es:instance|instance)/NumStringEntity/numEntProp/NumericEntity/intProp"))
// getPropertyRangePath for root level property
.concat(testGetPropertyRangePath("http://marklogic.com/EntitiesSearchEntity-0.0.1/NumStringEntity",
    "intProp", "/(es:envelope|envelope)/(es:instance|instance)/NumStringEntity/intProp"));


function testRangePathPropertyReferenceType(entityIRI, propertyPath) {
  const refType = lib.getPropertyReferenceType(entityIRI, propertyPath);
  return [test.assertEqual("path", refType)];
}

result = result
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
  return [test.assertEqual("element", refType)];
}

result = result
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
  return [test.assertTrue(result.definitions[expRes] !== null)];
}

function testGetEntityServiceTitle(entityIRI, expected) {
  const result = lib.findEntityServiceTitle(entityIRI);
  return [ test.assertEqual(expected, result) ];
}

result
// Exisiting IRI
.concat(testGetEntityDefinitionFromIRI("http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity",
    "EntitiesSearchEntity"))
// fetching nested objectType from IRI
.concat(testGetEntityDefinitionFromIRI("http://marklogic.com/EntitiesSearchEntity-0.0.1/NumStringEntity",
    "NumStringEntity"))
// test entity service title function
.concat(testGetEntityServiceTitle("http://marklogic.com/EntitiesSearchEntity-0.0.1/NumStringEntity", "NumStringEntity"))
.concat(testGetEntityServiceTitle("http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity", "EntitiesSearchEntity"));
