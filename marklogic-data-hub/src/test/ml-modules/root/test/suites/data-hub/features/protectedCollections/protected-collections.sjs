const sec = require("/MarkLogic/security.xqy");

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
const stepContext1 = "{\n" +
  "  \"name\" : \"MyTestStep\",\n" +
  "  \"type\" : \"MAPPING\",\n" +
  "  \"version\" : 1,\n" +
  "  \"options\" : {\n" +
  "    \"collections\" : [ \"mapping\", \"protected-content\" ],\n" +
  "    \"sourceDatabase\": \"data-hub-FINAL\",\n" +
  "    \"targetDatabase\": \"data-hub-FINAL\",\n" +
  "    \"mapping\" : {\n" +
  "      \"name\" : \"ProtectedCollections-ProtectedCollectionsMapping\",\n" +
  "      \"version\" : 0\n" +
  "    },\n" +
  "    \"targetEntity\" : \"Customer\",\n" +
  "    \"sourceQuery\" : \"cts.collectionQuery('default-ingestion')\"\n" +
  "  },\n" +
  "  \"features\": {\n" +
  "    \"protectedCollections\": {\n" +
  "      \"collections\": [\"myCollection\"],\n" +
  "      \"permissions\": \"data-hub-common-reader,read,data-hub-common-writer,update\"\n" +
  "    }\n" +
  "}\n";
const model1 = "Customer";
const contentObject1 = "{\n" +
  "  \"envelope\": {\n" +
  "    \"instance\": {\n" +
  "      \"id\": \"111\",\n" +
  "      \"firstname\": \"Nicky\",\n" +
  "      \"lastname\": \"Jones\"\n" +
  "    }\n" +
  "  }\n" +
  "}";

protectedCollections.onInstanceSave(stepContext1, model1, contentObject1);
// assert
protectedPathCollections = sec.protectedPathsCollection();
assertions.push(test.assertTrue(protectedPathCollections.includes("Customer")));

//Instance with protected collections in false
const stepContext2 = "{\n" +
  "  \"name\" : \"MyTestStep\",\n" +
  "  \"type\" : \"MAPPING\",\n" +
  "  \"version\" : 1,\n" +
  "  \"options\" : {\n" +
  "    \"collections\" : [ \"mapping\", \"protected-content\" ],\n" +
  "    \"sourceDatabase\": \"data-hub-FINAL\",\n" +
  "    \"targetDatabase\": \"data-hub-FINAL\",\n" +
  "    \"mapping\" : {\n" +
  "      \"name\" : \"ProtectedCollections-ProtectedCollectionsMapping\",\n" +
  "      \"version\" : 0\n" +
  "    },\n" +
  "    \"targetEntity\" : \"Customer\",\n" +
  "    \"sourceQuery\" : \"cts.collectionQuery('default-ingestion')\"\n" +
  "  },\n" +
  "  \"features\": {\n" +
  "    \"protectedCollections\": {\n" +
  "      \"enabled\": false,\n" +
  "      \"collections\": [\"myCollection\"],\n" +
  "      \"permissions\": \"data-hub-common-reader,read,data-hub-common-writer,update\"\n" +
  "    }\n" +
  "}\n";
const model2 = "Person";
const contentObject2 = "";

protectedCollections.onInstanceSave(stepContext2, model2, contentObject2);
// assert
assertions.push(test.assertFalse(protectedPathCollections.includes("Person")));

//Instance without protected collections
const stepContext3 = "";
const model3 = "Office";
const contentObject3 = "";

protectedCollections.onInstanceSave(stepContext3, model3, contentObject3);
// assert
assertions.push(test.assertFalse(protectedPathCollections.includes("Office")));

assertions;
