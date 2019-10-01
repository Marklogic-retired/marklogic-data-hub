declareUpdate();

const entityCollection = "jobInfoTestEntity";

const olderUri = "/" + entityCollection + "/older.json";
const newerUri = "/" + entityCollection + "/newer.json";

xdmp.documentInsert(olderUri, {"test": olderUri}, xdmp.defaultPermissions(), entityCollection);
xdmp.documentPutMetadata(olderUri, {"datahubCreatedOn": xs.dateTime("2019-09-19T00:00:00")});

xdmp.documentInsert(newerUri, {"test": newerUri}, xdmp.defaultPermissions(), entityCollection);
xdmp.documentPutMetadata(newerUri, {
  "datahubCreatedOn": xs.dateTime("2019-09-20T00:00:00"),
  "datahubCreatedByJob": "job1 job2 job3"
});
