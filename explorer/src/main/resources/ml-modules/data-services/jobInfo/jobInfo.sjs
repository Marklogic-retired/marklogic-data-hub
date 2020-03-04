/* Copyright 2019 MarkLogic Corporation. All rights reserved. */
'use strict';

var entityCollection;

let res = {
  "entityCollection": entityCollection,
  "latestJobId": null,
  "latestJobDateTime": null
};

let latestJob = fn.subsequence(
    cts.search(
        cts.collectionQuery(entityCollection),
        [cts.indexOrder(cts.fieldReference("datahubCreatedOn"), "descending")]
    ),
    1, 1
);

if (fn.count(latestJob) > 0) {
  let docUri = xdmp.nodeUri(latestJob);

  res.latestJobDateTime = xdmp.documentGetMetadataValue(docUri, "datahubCreatedOn");

  let jobIds = xdmp.documentGetMetadataValue(docUri, "datahubCreatedByJob");
  if (jobIds) {
    jobIds = jobIds.split(" ");
    res.latestJobId = jobIds[jobIds.length - 1];
  }
}

res;
