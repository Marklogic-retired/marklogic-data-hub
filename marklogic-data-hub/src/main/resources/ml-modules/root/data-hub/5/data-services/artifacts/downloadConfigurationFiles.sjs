xdmp.securityAssert("http://marklogic.com/data-hub/privileges/download-configuration-files", "execute");

const consts = require("/data-hub/5/impl/consts.sjs");

const userArtifacts = cts.search(cts.andQuery([
  cts.collectionQuery([
    consts.FLOW_COLLECTION,
    consts.ENTITY_MODEL_COLLECTION,
    consts.LOAD_DATA_COLLECTION,
    consts.LOAD_DATA_SETTINGS_COLLECTION,
    consts.MAPPING_COLLECTION,
    consts.MAPPING_ARTIFACT_COLLECTION,
    consts.MAPPING_SETTINGS_COLLECTION,
    consts.MATCHING_ARTIFACT_COLLECTION,
    consts.MATCHING_SETTINGS_COLLECTION,
    consts.STEP_DEFINITION_COLLECTION
  ]),
  cts.notQuery(
    cts.collectionQuery(consts.HUB_ARTIFACT_COLLECTION)
  )
])).toArray();

xdmp.zipCreate(
  userArtifacts.map(artifact => {
    return {"path": xdmp.nodeUri(artifact)};
  }),
  userArtifacts
);
