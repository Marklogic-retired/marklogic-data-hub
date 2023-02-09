xdmp.invokeFunction(() => {
  xdmp.collectionDelete('test-doc');

  xdmp.collectionDelete('datahubMasteringMatchSummary');
}, { update: "true" });