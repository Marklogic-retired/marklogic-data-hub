/** Copyright 2019 MarkLogic Corporation. All rights reserved. */
'use strict';

var entityCollection;

let res = {
  "entityCollection": entityCollection,
  "latestJobId": null,
  "latestJobDateTime": null
};

let query = [cts.collectionQuery(entityCollection), cts.fieldRangeQuery("datahubCreatedOn", "<=", fn.currentDateTime(), "score-function=reciprocal")];
let seq = fn.subsequence(cts.search(cts.andQuery(query)), 1, 1);

if (fn.count(seq) > 0) {
  let docUri = xdmp.nodeUri(seq);

  res.latestJobDateTime = xdmp.documentGetMetadataValue(docUri, "datahubCreatedOn");

  let jobIds = xdmp.documentGetMetadataValue(docUri, "datahubCreatedByJob");
  if (jobIds) {
    jobIds = jobIds.split(" ");
    res.latestJobId = jobIds[jobIds.length - 1];
  }
}

res;
