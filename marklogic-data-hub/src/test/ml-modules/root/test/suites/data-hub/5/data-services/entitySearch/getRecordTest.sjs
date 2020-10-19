const test = require("/test/test-helper.xqy");
const entitySearchService = require("/test/suites/data-hub/5/data-services/lib/entitySearchService.sjs");

function getJsonRecordTest() {
  const docUri = "/content/jane.json";
  xdmp.invokeFunction(function() {
    declareUpdate();
    xdmp.documentSetMetadata("/content/jane.json",
        {
          "datahubCreatedByStep": "map-step",
          "datahubCreatedInFlow": "CurateCustomerJSON",
          "datahubCreatedOn": "2020-10-08T15:14:28.772612-07:00"
        });
  });

  const record = entitySearchService.getRecord(docUri);
  const expectedMetadata = JSON.stringify({
    "datahubCreatedByStep": "map-step",
    "datahubCreatedInFlow": "CurateCustomerJSON",
    "datahubCreatedOn": "2020-10-08T15:14:28.772612-07:00"
  });

  const expectedSources = JSON.stringify([{
    "name": "testSourceForCustomer",
    "datahubSourceType": "testSourceType"
  }]);

  return[
    test.assertEqual(fn.doc(docUri), record.data),
    test.assertEqual(expectedMetadata, JSON.stringify(record.recordMetadata)),
    test.assertEqual(true, record.isHubEntityInstance),
    test.assertEqual("json", record.recordType),
    test.assertEqual(expectedSources, JSON.stringify(record.sources))
  ];
}

function getXmlRecordTest() {
  const docUri = "/content/jane.xml";
  xdmp.invokeFunction(function() {
    declareUpdate();
    xdmp.documentSetMetadata("/content/jane.xml",
        {
          "datahubCreatedByStep": "map-step",
          "datahubCreatedInFlow": "CurateCustomerXML",
          "datahubCreatedOn": "2020-10-08T15:14:28.772612-07:00"
        });
  });

  const record = entitySearchService.getRecord(docUri);
  const expectedMetadata = JSON.stringify({
    "datahubCreatedByStep": "map-step",
    "datahubCreatedInFlow": "CurateCustomerXML",
    "datahubCreatedOn": "2020-10-08T15:14:28.772612-07:00"
  });
  const expectedSources = JSON.stringify([{
    "name": "testSourceForCustomerXML",
    "datahubSourceType": "testSourceTypeXML"
  }]);

  return[
    test.assertEqual(fn.doc(docUri), record.data),
    test.assertEqual(expectedMetadata, JSON.stringify(record.recordMetadata)),
    test.assertEqual(true, record.isHubEntityInstance),
    test.assertEqual("xml", record.recordType),
    test.assertEqual(expectedSources, JSON.stringify(record.sources))
  ];
}

function getTextRecordTest() {
  const docUri = "/content/jane.txt";
  xdmp.invokeFunction(function() {
    declareUpdate();
    xdmp.documentSetMetadata("/content/jane.txt",
        {
          "datahubCreatedByStep": "ingest-step",
          "datahubCreatedInFlow": "ingestText",
          "datahubCreatedOn": "2020-10-08T15:14:28.772612-07:00"
        });
  });

  const record = entitySearchService.getRecord(docUri);
  const expectedMetadata = JSON.stringify({
    "datahubCreatedByStep": "ingest-step",
    "datahubCreatedInFlow": "ingestText",
    "datahubCreatedOn": "2020-10-08T15:14:28.772612-07:00"
  });

  return[
    test.assertEqual(fn.doc(docUri), record.data),
    test.assertEqual(expectedMetadata, JSON.stringify(record.recordMetadata)),
    test.assertEqual(false, record.isHubEntityInstance),
    test.assertEqual("text", record.recordType)
  ];
}

function getNonExistentRecordTest() {
  const docUri = "/content/nonExistentRecord.json";
  const record = entitySearchService.getRecord(docUri);
  return [
    test.assertEqual(0, Object.keys(record).length)
  ]
}

[]
    .concat(getJsonRecordTest())
    .concat(getXmlRecordTest())
    .concat(getTextRecordTest())
    .concat(getNonExistentRecordTest());
