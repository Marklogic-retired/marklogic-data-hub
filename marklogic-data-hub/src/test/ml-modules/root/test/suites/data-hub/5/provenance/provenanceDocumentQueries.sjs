declareUpdate();
// This tests provenance planned for the 5.7.0 release
const dhProv = require('/data-hub/5/provenance/dh-provenance.xqy');
const config = require("/com.marklogic.hub/config.sjs");
const test = require("/test/test-helper.xqy");
const hubUtil = require("/data-hub/5/impl/hub-utils.sjs");
const flowProvenance = require("/data-hub/5/flow/flowProvenance.sjs");
const StepExecutionContext = require("/data-hub/5/flow/stepExecutionContext.sjs");
const provLib = require("/data-hub/5/impl/prov.sjs");
const provQueryLib = require("/data-hub/5/provenance/prov-lib.sjs");
const stagingDB = config.STAGINGDATABASE;
const finalDB = config.FINALDATABASE;
const assertions = [];

const flowName = "endToEndFlow";

const endToEndFlow = {
  name:flowName,
  steps: {
    "1": {
      name:"ingestionStep",
      stepDefinitionName: "default-ingest",
      stepDefinitionType: "ingestion"
    },
    "2": {
      name:"mappingStep",
      stepDefinitionName: "entity-services-mapping",
      stepDefinitionType: "mapping"
    },
    "3": {
      name:"matchingStep",
      stepDefinitionName: "default-matching",
      stepDefinitionType: "matching"
    },
    "4": {
      name:"mergingStep",
      stepDefinitionName: "default-merging",
      stepDefinitionType: "merging"
    }
  }
};

let provDocument;
// Setup different step contexts
const ingestionStepExecutionContext = new StepExecutionContext(
  endToEndFlow,
  "1",
  {name:"ingestionStep", type: "ingestion"},
  "my-ingestion-job",
  { latestProvenance: true, sourceName: "External Table", sourceType: "SQL", targetDatabase: stagingDB }
);
const mappingStepExecutionContext = new StepExecutionContext(
  endToEndFlow,
  "2",
  {name:"mappingStep", type: "mapping"},
  "my-mapping-job",
  { latestProvenance: true, sourceDatabase: stagingDB, targetDatabase: finalDB }
);
const mergingStepExecutionContext = new StepExecutionContext(
  endToEndFlow,
  "4",
  {name:"mergingStep", type: "merging"},
  "my-merging-job",
  { latestProvenance: true, sourceDatabase: finalDB, targetDatabase: finalDB }
);
const provenanceWriteQueue = provLib.getProvenanceWriteQueue();
const getOptions = () => {
  return {
    "startDateTime": fn.currentDateTime().add(xdmp.elapsedTime()),
    "endDateTime": fn.currentDateTime().add(xdmp.elapsedTime()),
    "user": xdmp.getCurrentUser()
  };
};

// create ingest provenance
xdmp.invokeFunction(() => {
  const record = dhProv.newProvenanceRecord("my-ingestion-job", getOptions());
  dhProv.insertProvenanceRecord(record, ingestionStepExecutionContext.getTargetDatabase());
  ingestionStepExecutionContext.completedItems = ["testJSONObjectInstance1.json","testJSONObjectInstance2.json"];
  flowProvenance.writeProvenanceData(ingestionStepExecutionContext, [
    {uri: "testJSONObjectInstance1.json", value: {}},
    {uri: "testJSONObjectInstance2.json", value: {}}
  ]);

  provenanceWriteQueue.persist(stagingDB);
}, { database: xdmp.database(stagingDB), update: "true", commit: "auto"});

// create mapping provenance
xdmp.invokeFunction(() => {
  const record = dhProv.newProvenanceRecord("my-mapping-job", getOptions());
  dhProv.insertProvenanceRecord(record, mappingStepExecutionContext.getTargetDatabase());
  mappingStepExecutionContext.completedItems = ["testJSONObjectInstance1.json","testJSONObjectInstance2.json"];
  flowProvenance.writeProvenanceData(mappingStepExecutionContext, [
    {previousUri: ["testJSONObjectInstance1.json"], uri: "testJSONObjectInstance1.json", value: { envelope:{ instance: { info: { title: "Customer", version: "0.0.1"}}}}},
    {previousUri: ["testJSONObjectInstance2.json"], uri: "testJSONObjectInstance2.json", value: { envelope:{ instance: { info: { title: "Customer", version: "0.0.1"}}}}}
  ]);
  provenanceWriteQueue.persist(finalDB);
}, { update: "true", commit: "auto"});

// create merging provenance
xdmp.invokeFunction(() => {
  const record = dhProv.newProvenanceRecord("my-merging-job", getOptions());
  dhProv.insertProvenanceRecord(record, mergingStepExecutionContext.getTargetDatabase());
  mergingStepExecutionContext.completedItems = ["testJSONObjectInstance1.json", "testJSONObjectInstance2.json", "testJSONObjectInstanceMerged.json"];
  flowProvenance.writeProvenanceData(mergingStepExecutionContext, [
    {provenance: false, uri: "testJSONObjectInstance1.json", value: {envelope: {instance: {info: {title: "Customer", version: "0.0.1"}}}}},
    {provenance: false, uri: "testJSONObjectInstance2.json", value: {envelope: {instance: {info: {title: "Customer", version: "0.0.1"}}}}},
    {
      previousUri: ["testJSONObjectInstance1.json", "testJSONObjectInstance2.json"],
      uri: "testJSONObjectInstanceMerged.json",
      value: {envelope: {instance: {info: {title: "Customer", version: "0.0.1"}}}}
    }
  ]);
  provenanceWriteQueue.persist(finalDB);
}, { update: "true", commit: "auto"});

const sourceInformationForMerged = fn.head(hubUtil.invokeFunction(function() { return provQueryLib.sourceInformationForDocument("testJSONObjectInstanceMerged.json"); }, finalDB));
assertions.push(
  test.assertEqual("External Table", sourceInformationForMerged[0].dataSourceName, "Data Source Name for merged should be 'External Table'"),
  test.assertEqual("SQL", sourceInformationForMerged[0].dataSourceType, "Data Source Type for merged should be 'SQL'")
);
const stepsRunAgainstMerged = fn.head(hubUtil.invokeFunction(function() { return provQueryLib.stepsRunAgainstDocument("testJSONObjectInstanceMerged.json"); }, finalDB));
assertions.push(
  test.assertEqual("mergingStep", stepsRunAgainstMerged[0].stepName),
  test.assertEqual("mappingStep", stepsRunAgainstMerged[1].stepName),
  test.assertEqual("ingestionStep", stepsRunAgainstMerged[2].stepName)
);
const derivedFromForMerged = fn.head(hubUtil.invokeFunction(function() { return provQueryLib.derivedFromDocuments("testJSONObjectInstanceMerged.json"); }, finalDB));
assertions.push(
  test.assertEqual("testJSONObjectInstanceMerged.json", derivedFromForMerged[0].derivedFromDocument),
  test.assertEqual(finalDB, derivedFromForMerged[0].database),
  test.assertEqual("testJSONObjectInstance2.json", derivedFromForMerged[1].derivedFromDocument),
  test.assertEqual(finalDB, derivedFromForMerged[1].database),
  test.assertEqual("testJSONObjectInstance1.json", derivedFromForMerged[2].derivedFromDocument),
  test.assertEqual(finalDB, derivedFromForMerged[2].database),
  test.assertEqual("testJSONObjectInstance2.json", derivedFromForMerged[3].derivedFromDocument),
  test.assertEqual(stagingDB, derivedFromForMerged[3].database),
  test.assertEqual("testJSONObjectInstance1.json", derivedFromForMerged[4].derivedFromDocument),
  test.assertEqual(stagingDB, derivedFromForMerged[4].database)
);
const documentActivitiesForMerged = fn.head(hubUtil.invokeFunction(function() { return provQueryLib.documentActivities("testJSONObjectInstanceMerged.json"); }, finalDB));
assertions.push(
  test.assertEqual("my-merging-job", documentActivitiesForMerged[0].activityLabel),
  test.assertEqual("my-mapping-job", documentActivitiesForMerged[1].activityLabel),
  test.assertEqual("my-ingestion-job", documentActivitiesForMerged[2].activityLabel)
);
assertions;