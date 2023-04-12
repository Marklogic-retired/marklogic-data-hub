function getoldestMpin(
  MasterPersonIndex,
  properties,
  propertySpec
)
{
  let uris = properties.map(x => x.sources.documentUri) // map() aka "gather"
  console.log('Input URIS[0]',uris)
  let findMasterQuery = 
      cts.andQuery([
        cts.collectionQuery("sm-Member-mastered"),
        cts.jsonPropertyValueQuery("Uris", uris)
      ])
  let masterDocUris = cts.uris(null, null, findMasterQuery).toArray()
  console.log('OutputOfMasterDocUris',masterDocUris)
  let masterDoc = null;
   if (masterDocUris.length == 0) {
     console.log('I am in length = 0')
    masterDoc = cts.doc(uris[0]); // pick one of the multiple incoming, non-master docs and use the MPIN (which must be set as provisional MPIN in mapping step)
  } else if (masterDocUris.length == 1) {
    console.log('I am in length=1','MasterDocUris',masterDocUris,'PropUris',uris)
    masterDoc = cts.doc(masterDocUris[0])
  } else { // two or more master docs exist for this set of merged values. E.g. mastering rules changed to be more permissive and mastering was re-run.
    xdmp.log("Merge attempted on two master docs.  URIs = "+ masterDocUris.join(), "warning")
    // TODO: notify systems via writing some kind of MergeNotify doc with master merge and sent as event to all systems. 
    masterDoc = cts.doc(masterDocUris[0]); // pick the first of the multiple masters and use that MPI. Unfortunately, the other MPI will be eliminated from the mastet set.
  }
  let mPin = masterDoc.toObject().envelope.instance.Member.MasterPersonIndex // for the master doc, keep the MPI
  let propsWithMpin = properties.filter(p => p.values == mPin)
    console.log('value of propsWithMpin', xdmp.quote(propsWithMpin))
  return propsWithMpin
}
module.exports = {
  getoldestMpin
}