const test = require("/test/test-helper.xqy");

function invokeService(entityTypeId, propertyPath, referenceType) {
  return fn.head(xdmp.invoke(
      "/data-hub/5/data-services/entitySearch/getMinAndMaxPropertyValues.sjs",
      {
        "entityTypeId": entityTypeId,
        "propertyPath": propertyPath,
        "referenceType": referenceType
      }
  ));
}

// Uncomment the tests when DHFPROD-4494 bug is resolved.
/*function testMinMaxTwoLevelNesting() {
  let entityTypeId = "http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity";
  let propertyPath = "numStrEntityProp/numEntProp/intProp";
  const result = invokeService(entityTypeId, propertyPath, "path");
  return [
    test.assertEqual(11, result.min),
    test.assertEqual(77, result.max)
  ];
}

function testMinMaxOneLevelNesting() {
  let entityTypeId = "http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity";
  let propertyPath = "numStrEntityProp/intProp";
  const result = invokeService(entityTypeId, propertyPath, "path");
  return [
    test.assertEqual(1, result.min),
    test.assertEqual(2, result.max)
  ];
}

function testMinMaxLongProperty() {
  let entityTypeId = "http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity";
  let propertyPath = "numStrEntityProp/numEntProp/longProp";
  const result = invokeService(entityTypeId, propertyPath, "path");
  return [
    test.assertEqual(110, result.min),
    test.assertEqual(757, result.max)
  ];
}*/

function testMinMaxDecimalProperty() {
  let entityTypeId = "http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity";
  let propertyPath = "decimalProp";
  const result = invokeService(entityTypeId, propertyPath, "element");
  return [
    test.assertEqual(1000.5, result.min),
    test.assertEqual(7557.5, result.max)
  ];
}

function testMinMaxDoubleProperty() {
  let entityTypeId = "http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity";
  let propertyPath = "doubleProp";
  const result = invokeService(entityTypeId, propertyPath, "element");
  return [
    test.assertEqual(100000.0, result.min),
    test.assertEqual(755577.0, result.max)
  ];
}

function testMinMaxFloatProperty() {
  let entityTypeId = "http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity";
  let propertyPath = "floatProp";
  const result = invokeService(entityTypeId, propertyPath, "element");
  return [
    test.assertEqual(10000.0, result.min),
    test.assertEqual(75577.0, result.max)
  ];
}

[]
.concat(testMinMaxDecimalProperty())
.concat(testMinMaxDoubleProperty())
.concat(testMinMaxFloatProperty());
/*
.concat(testMinMaxTwoLevelNesting())
.concat(testMinMaxOneLevelNesting())
.concat(testMinMaxLongProperty())*/
