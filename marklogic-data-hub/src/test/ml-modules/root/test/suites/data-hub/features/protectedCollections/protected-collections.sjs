import sec from "/MarkLogic/security.xqy";

const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const protectedCollections = mjsProxy.requireMjsModule("/data-hub/features/protected-collections.mjs");

let protectedPathCollections = "";

protectedCollections.onArtifactPublish ("Step", "ProtectedCollectionsMapping");
// assert
protectedPathCollections = sec.protectedPathsCollection();
const assertions = [
  test.assertTrue(protectedPathCollections.includes("ProtectedCollectionsMapping"))
];


protectedCollections.onArtifactPublish ("Entity", "Customer");
// assert
protectedPathCollections = sec.protectedPathsCollection();
assertions.push(test.assertTrue(protectedPathCollections.includes("Customer")));

//Reset protected collection
sec.unprotectCollection("Customer");
assertions.push(test.assertFalse(protectedPathCollections.includes("Customer")));

//Instance with protected collections
const stepContext = "";
const model = "Customer";
const contentObject = "";

protectedCollections.onInstanceSave(stepContext, model, contentObject);
// assert
protectedPathCollections = sec.protectedPathsCollection();
assertions.push(test.assertTrue(protectedPathCollections.includes("Customer")));

//Instance with protected collections in false
const stepContext = "";
const model = "Person";
const contentObject = "";

protectedCollections.onInstanceSave(stepContext, model, contentObject);
// assert
assertions.push(test.assertFalse(protectedPathCollections.includes("Person")));

//Instance without protected collections
const stepContext = "";
const model = "Office";
const contentObject = "";

protectedCollections.onInstanceSave(stepContext, model, contentObject);
// assert
assertions.push(test.assertFalse(protectedPathCollections.includes("Office")));

assertions;
