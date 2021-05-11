const test = require("/test/test-helper.xqy");
const entityLib = require("/data-hub/5/impl/entity-lib.sjs");

const uris = ["/content/person1.json","/content/person2.json"];
const entityType = "http://marklogic.com/example/PersonModel-0.0.1/Person";

const results = [];

const resultsPassingArray = entityLib.findEntityIdentifiers(uris, entityType);
results.push(test.assertEqual("123-45-6789", resultsPassingArray[uris[0]], "Should find the correct identifier for person1"));
results.push(test.assertEqual("987-65-4321", resultsPassingArray[uris[1]], "Should find the correct identifier for person2"));

const resultsPassingSequence = entityLib.findEntityIdentifiers(Sequence.from(uris), entityType);
results.push(test.assertEqual("123-45-6789", resultsPassingSequence[uris[0]], "Should find the correct identifier for person1"));
results.push(test.assertEqual("987-65-4321", resultsPassingSequence[uris[1]], "Should find the correct identifier for person2"));

const resultsPassingSingleValue = entityLib.findEntityIdentifiers(uris[0], entityType);
results.push(test.assertEqual("123-45-6789", resultsPassingSingleValue[uris[0]], "Should find the correct identifier for person1"));

results;