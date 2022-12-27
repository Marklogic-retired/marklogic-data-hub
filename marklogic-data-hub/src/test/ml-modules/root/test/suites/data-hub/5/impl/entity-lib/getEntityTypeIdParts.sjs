const test = require("/test/test-helper.xqy");
const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const entityLib = mjsProxy.requireMjsModule("/data-hub/5/impl/entity-lib.mjs");

function validEntityTypeId() {
  const parts = entityLib.getEntityTypeIdParts("http://example.org/PersonModel-1/Person");
  return [
    test.assertEqual("http://example.org/", parts.baseUri),
    test.assertEqual("PersonModel", parts.modelTitle),
    test.assertEqual("1", parts.version),
    test.assertEqual("Person", parts.entityTypeTitle)
  ];
}

function validEntityTypeIdWithLongerBaseUri() {
  const parts = entityLib.getEntityTypeIdParts("http://example.org/more/PersonModel-1/Person");
  return [
    test.assertEqual("http://example.org/more/", parts.baseUri),
    test.assertEqual("PersonModel", parts.modelTitle),
    test.assertEqual("1", parts.version),
    test.assertEqual("Person", parts.entityTypeTitle)
  ];
}

function inputIsASemIRI() {
  const parts = entityLib.getEntityTypeIdParts(sem.iri("http://example.org/PersonModel-1/Person"));
  return [
    test.assertEqual("http://example.org/", parts.baseUri),
    test.assertEqual("PersonModel", parts.modelTitle),
    test.assertEqual("1", parts.version),
    test.assertEqual("Person", parts.entityTypeTitle)
  ];
}

function versionLacksHyphen() {
  try {
    entityLib.getEntityTypeIdParts("http://example.org/NoVersion/Person");
    throw Error("Expected a failure because there's no version in the EntityTypeId");
  } catch (e) {
    return test.assertEqual("Could not get EntityTypeId parts; expected info part did not contain a hyphen; " +
      "EntityTypeId: http://example.org/NoVersion/Person", e.message);
  }
}

function entityTypeTitleIsMissing() {
  try {
    entityLib.getEntityTypeIdParts("http://example.org/NoEntityTypeTitle-1");
    throw Error("Expected a failure because example.org will be assumed to contain the model title and version, but there's no hyphen");
  } catch (e) {
    return test.assertEqual("Could not get EntityTypeId parts; expected info part did not contain a hyphen; " +
      "EntityTypeId: http://example.org/NoEntityTypeTitle-1", e.message);
  }
}

function notEnoughForwardSlashes() {
  try {
    entityLib.getEntityTypeIdParts("definitely/invalid");
    throw Error("Expected error because the EntityTypeId doesn't have at least 3 tokens separated by a /");
  } catch (e) {
    return test.assertEqual("Could not get EntityTypeId parts from invalid EntityTypeId: definitely/invalid", e.message);
  }
}

function invalidBaseUriIsStillAccepted() {
  const parts = entityLib.getEntityTypeIdParts("seems-invalid/PersonModel-1/Person");
  return [
    test.assertEqual("seems-invalid/", parts.baseUri, "I don't believe this is a valid IRI, but since " +
      "it has at least 3 tokens, and the second token from the end has a hyphen, the parts can still be " +
      "extracted. I don't think this should throw an error because this function shouldn't worry about trying " +
      "to validate an IRI. As long as it can extract what it thinks are a baseUri, version, and titles, then it" +
      "should do so."),
    test.assertEqual("PersonModel", parts.modelTitle),
    test.assertEqual("1", parts.version),
    test.assertEqual("Person", parts.entityTypeTitle)
  ];
}

function versionHasAHyphenInIt() {
  const parts = entityLib.getEntityTypeIdParts("http://example.org/PersonModel-1.0-SNAPSHOT/Person");
  return [
    test.assertEqual("http://example.org/", parts.baseUri),
    test.assertEqual("PersonModel", parts.modelTitle),
    test.assertEqual("1.0-SNAPSHOT", parts.version),
    test.assertEqual("Person", parts.entityTypeTitle)
  ];
}

function entityTypeTitleHasForwardSlash() {
  try {
    entityLib.getEntityTypeIdParts("http://example.org/PersonModel-1.0/Person/ThisIsntSupported");
    throw Error("Expected error because if the EntityTypeTitle has a forward slash, then the string before the last " +
      "forward slash is assumed to be the ModelTitle + ModelVersion, and that doesn't have a hyphen. ");
  } catch (e) {
    return test.assertEqual("Could not get EntityTypeId parts; expected info part did not contain a hyphen; EntityTypeId: http://example.org/PersonModel-1.0/Person/ThisIsntSupported", e.message);
  }
}

[]
  .concat(validEntityTypeId())
  .concat(validEntityTypeIdWithLongerBaseUri())
  .concat(inputIsASemIRI())
  .concat(versionLacksHyphen())
  .concat(entityTypeTitleIsMissing())
  .concat(notEnoughForwardSlashes())
  .concat(invalidBaseUriIsStillAccepted())
  .concat(versionHasAHyphenInIt())
  .concat(entityTypeTitleHasForwardSlash());
