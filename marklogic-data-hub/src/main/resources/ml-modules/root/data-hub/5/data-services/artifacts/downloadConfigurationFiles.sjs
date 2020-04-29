xdmp.securityAssert("http://marklogic.com/data-hub/privileges/download-configuration-files", "execute");

const config = require("/com.marklogic.hub/config.sjs");
const consts = require("/data-hub/5/impl/consts.sjs");
const hent = require("/data-hub/5/impl/hub-entities.xqy");

const userArtifacts = cts.search(cts.andQuery([
  cts.collectionQuery(consts.USER_ARTIFACT_COLLECTIONS),
  cts.notQuery(
    cts.collectionQuery(consts.HUB_ARTIFACT_COLLECTION)
  )
])).toArray();

const zipPaths = [];
const zipFiles = [];
userArtifacts.forEach(artifact => {
  zipPaths.push({"path": xdmp.nodeUri(artifact)});
  zipFiles.push(artifact);
});

const entityModels = cts.search(cts.collectionQuery(consts.ENTITY_MODEL_COLLECTION)).toArray();
if (entityModels.length > 0) {
  const securityConfig = hent.dumpPii(entityModels).toObject();

  // Add PII files
  const protectedPathsExist = securityConfig.config && securityConfig.config["protected-path"] && securityConfig.config["protected-path"].length > 0;
  if (protectedPathsExist) {
    securityConfig.config["protected-path"].forEach((path, index) => {
      zipPaths.push({"path": "/src/main/ml-config/security/protected-paths/pii-protected-path-" + (index + 1) + ".json"});
      zipFiles.push(xdmp.toJSON(path));
    });
    if (securityConfig.config["query-roleset"]) {
      zipPaths.push({"path": "/src/main/ml-config/security/query-rolesets/pii-reader.json"});
      zipFiles.push(xdmp.toJSON(securityConfig.config["query-roleset"]));
    }
  }

  // Add search options
  const searchOptions = hent.dumpSearchOptions(entityModels, false);
  const explorerSearchOptions = hent.dumpSearchOptions(entityModels, true);
  ["staging", "final"].forEach(db => {
    zipPaths.push({"path": "/src/main/entity-config/" + db + "-entity-options.xml"});
    zipPaths.push({"path": "/src/main/entity-config/exp-" + db + "-entity-options.xml"});
    zipFiles.push([searchOptions, explorerSearchOptions]);
  });

  // Add database properties
  const dbProps = hent.dumpIndexes(entityModels);
  const stagingProps = dbProps.toObject();
  stagingProps["database-name"] = config.STAGINGDATABASE;
  const finalProps = dbProps.toObject();
  finalProps["database-name"] = config.FINALDATABASE;
  zipPaths.push(
    {"path": "/src/main/entity-config/databases/staging-database.json"},
    {"path": "/src/main/entity-config/databases/final-database.json"}
  );
  zipFiles.push([xdmp.toJSON(stagingProps), xdmp.toJSON(finalProps)]);
}

xdmp.zipCreate(zipPaths, zipFiles);
