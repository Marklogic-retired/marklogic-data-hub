const test = require("/test/test-helper.xqy");
const entityLib = require("/data-hub/5/impl/entity-lib.sjs");

function validIRI() {
  const parts = entityLib.getEntityIRIParts("http://example.org/PersonModel-1/Person");
  return [
    test.assertEqual("http://example.org/", parts.baseUri),
    test.assertEqual("PersonModel", parts.modelTitle),
    test.assertEqual("1", parts.version),
    test.assertEqual("Person", parts.entityTitle)
  ];
}

function validIRIWithLongerBaseUri() {
  const parts = entityLib.getEntityIRIParts("http://example.org/more/PersonModel-1/Person");
  return [
    test.assertEqual("http://example.org/more/", parts.baseUri),
    test.assertEqual("PersonModel", parts.modelTitle),
    test.assertEqual("1", parts.version),
    test.assertEqual("Person", parts.entityTitle)
  ];
}

function inputIsASemIRI() {
  const parts = entityLib.getEntityIRIParts(sem.iri("http://example.org/PersonModel-1/Person"));
  return [
    test.assertEqual("http://example.org/", parts.baseUri),
    test.assertEqual("PersonModel", parts.modelTitle),
    test.assertEqual("1", parts.version),
    test.assertEqual("Person", parts.entityTitle)
  ];
}

function versionLacksHyphen() {
  try {
    entityLib.getEntityIRIParts("http://example.org/NoVersion/Person");
    throw Error("Expected a failure because there's no version in the IRI");
  } catch (e) {
    return test.assertEqual("Could not get entity IRI parts; expected info part did not contain a hyphen; " +
      "IRI: http://example.org/NoVersion/Person", e.message);
  }
}

function entityTitleIsMissing() {
  try {
    entityLib.getEntityIRIParts("http://example.org/NoEntityTitle-1");
    throw Error("Expected a failure because example.org will be assumed to contain the model title and version, but there's no hyphen");
  } catch (e) {
    return test.assertEqual("Could not get entity IRI parts; expected info part did not contain a hyphen; " +
      "IRI: http://example.org/NoEntityTitle-1", e.message);
  }
}

function notEnoughForwardSlashes() {
  try {
    entityLib.getEntityIRIParts("definitely/invalid");
    throw Error("Expected error because the IRI doesn't have at least 3 tokens separated by a /");
  } catch (e) {
    return test.assertEqual("Could not get entity IRI parts from invalid IRI: definitely/invalid", e.message);
  }
}

function invalidBaseUriIsStillAccepted() {
  const parts = entityLib.getEntityIRIParts("seems-invalid/PersonModel-1/Person");
  return [
    test.assertEqual("seems-invalid/", parts.baseUri, "I don't believe this is a valid IRI, but since " +
      "it has at least 3 tokens, and the second token from the end has a hyphen, the parts can still be " +
      "extracted. I don't think this should throw an error because this function shouldn't worry about trying " +
      "to validate an IRI. As long as it can extract what it thinks are a baseUri, version, and titles, then it" +
      "should do so."),
    test.assertEqual("PersonModel", parts.modelTitle),
    test.assertEqual("1", parts.version),
    test.assertEqual("Person", parts.entityTitle)
  ];
}

[]
  .concat(validIRI())
  .concat(validIRIWithLongerBaseUri())
  .concat(inputIsASemIRI())
  .concat(versionLacksHyphen())
  .concat(entityTitleIsMissing())
  .concat(notEnoughForwardSlashes())
  .concat(invalidBaseUriIsStillAccepted());
