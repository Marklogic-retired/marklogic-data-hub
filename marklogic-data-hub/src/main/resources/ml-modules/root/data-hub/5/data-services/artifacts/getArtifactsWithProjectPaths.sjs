/**
 Copyright (c) 2020 MarkLogic Corporation

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
'use strict';

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/download-project-files", "execute");

const config = require("/com.marklogic.hub/config.sjs");
const consts = require("/data-hub/5/impl/consts.sjs");
const hent = require("/data-hub/5/impl/hub-entities.xqy");

const artifactsWithProjectPaths = [];

const userArtifactQuery = cts.andQuery([
  cts.collectionQuery(consts.USER_ARTIFACT_COLLECTIONS),
  cts.notQuery(
    cts.collectionQuery(consts.HUB_ARTIFACT_COLLECTION)
  )
]);

cts.search(userArtifactQuery).toArray().forEach(artifact => {
  artifactsWithProjectPaths.push({"path": xdmp.nodeUri(artifact), "json": artifact});
});

const entityModels = cts.search(cts.collectionQuery(consts.ENTITY_MODEL_COLLECTION)).toArray();
if (entityModels.length > 0) {
  const securityConfig = hent.dumpPii(entityModels).toObject();

  // Add PII files
  const protectedPathsExist = securityConfig.config && securityConfig.config["protected-path"] && securityConfig.config["protected-path"].length > 0;
  if (protectedPathsExist) {
    securityConfig.config["protected-path"].forEach((path, index) => {
      artifactsWithProjectPaths.push({
        path: "/src/main/ml-config/security/protected-paths/pii-protected-path-" + (index + 1) + ".json",
        json: path
      });
    });
    if (securityConfig.config["query-roleset"]) {
      artifactsWithProjectPaths.push({
        path: "/src/main/ml-config/security/query-rolesets/pii-reader.json",
        json: securityConfig.config["query-roleset"]
      });
    }
  }

  // Add search options
  const searchOptions = hent.dumpSearchOptions(entityModels, false);
  const explorerSearchOptions = hent.dumpSearchOptions(entityModels, true);
  ["staging", "final"].forEach(db => {
    artifactsWithProjectPaths.push({
      path: "/src/main/entity-config/" + db + "-entity-options.xml",
      xml: xdmp.quote(searchOptions)
    });
    artifactsWithProjectPaths.push({
      path: "/src/main/entity-config/exp-" + db + "-entity-options.xml",
      xml: xdmp.quote(explorerSearchOptions)
    });
  });

  // Add database properties
  const dbProps = hent.dumpIndexes(entityModels);
  const stagingProps = dbProps.toObject();
  stagingProps["database-name"] = config.STAGINGDATABASE;
  const finalProps = dbProps.toObject();
  finalProps["database-name"] = config.FINALDATABASE;
  artifactsWithProjectPaths.push({
    path: "/src/main/entity-config/databases/staging-database.json",
    json: stagingProps
  });
  artifactsWithProjectPaths.push({
    path: "/src/main/entity-config/databases/final-database.json",
    json: finalProps
  });
}

artifactsWithProjectPaths;
