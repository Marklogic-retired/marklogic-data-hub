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

const entityLib = require("/data-hub/5/impl/entity-lib.sjs");
const Flow = require('./flow');
const LoadData = require('./loadData');
const Mapping = require('./mapping');
const Matching = require('./matching');
const Merging = require('./merging');
const Mastering = require('./mastering');
const StepDef = require('./stepDefinition');
const CustomStep = require('./customStep')

const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const DataHubSingleton = require('/data-hub/5/datahub-singleton.sjs');
const dataHub = DataHubSingleton.instance();

// define constants for caching expensive operations
const cachedArtifacts = {};
const registeredArtifactTypes = {
    ingestion: LoadData,
    flow: Flow,
    stepDefinition: StepDef,
    mapping: Mapping,
    matching: Matching,
    merging: Merging,
    mastering: Mastering,
    custom: CustomStep
};

const entityServiceDrivenArtifactTypes = ['mapping', 'custom', 'matching', 'merging'];

function getArtifacts(artifactType, groupByEntityType = entityServiceDrivenArtifactTypes.includes(artifactType)) {
    const queries = [];
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);

    const artifactCollections = artifactLibrary.getCollections();
    if (artifactCollections != null && artifactCollections.length > 0) {
      queries.push(cts.andQuery(artifactCollections.map(coll => cts.collectionQuery(coll))));
    }

    if (queries.length) {
      // Since these are user-specific artifacts, hub artifacts (flows and step definitions) are excluded
      queries.push(cts.notQuery(cts.collectionQuery(dataHub.consts.HUB_ARTIFACT_COLLECTION)));

      if (groupByEntityType) {
        return getArtifactsGroupByEntity(queries)
      } else {
        return cts.search(cts.andQuery(queries)).toArray().map((artifact) => artifact.toObject());
      }
    }
    return [];
}

function getEntityTitles() {
  return cts.search(cts.collectionQuery("http://marklogic.com/entity-services/models")).toArray().map(e => e.xpath("//info//title"));
}

/**
 * To keep things interesting, this needs to support finding artifacts associated with entities where targetEntityType
 * on an artifact can either be an entityName - e.g. "Customer" - or an entityTypeId - "http://example.org/Customer-0.0.1/Customer".
 * That's because mappings require entityTypeId, but other artifacts will accept an entityName.
 *
 * @param queries
 * @returns {*[]}
 */
function getArtifactsGroupByEntity(queries) {
  // This is our map of results
  const entityNameMap = {};

  // Need all of these for our artifacts query
  const entityNamesAndTypeIds = [];

  // Iterate over all entity models to prepare our entityNameMap and collect names and IDs
  fn.collection(entityLib.getModelCollection()).toArray().forEach(model => {
    model = model.toObject();
    const entityName = model.info.title;
    const entityTypeId = entityLib.getEntityTypeId(model, entityName);
    // TODO Should use "entityName" instead of "entityType", but the UI currently expects "entityType"
    entityNameMap[entityName] = {entityType: entityName, entityTypeId, artifacts:[]};
    entityNamesAndTypeIds.push(entityName, entityTypeId);
  });

  // Find all matching artifacts
  const artifacts = cts.search(cts.andQuery(
    queries.concat(cts.jsonPropertyValueQuery(["targetEntityType","targetEntity"], entityNamesAndTypeIds))
  )).toArray();

  // Figure out where each artifact goes in the entityNameMap
  const artifactMap = {};
  artifacts.forEach(artifact => {
    artifact = artifact.toObject();
    const targetEntityType = artifact.targetEntityType || artifact.targetEntity;
    if (entityNameMap[targetEntityType]) {
      entityNameMap[targetEntityType].artifacts.push(artifact);
    } else {
      for (var entityName of Object.keys(entityNameMap)) {
        if (entityNameMap[entityName].entityTypeId == targetEntityType) {
          entityNameMap[entityName].artifacts.push(artifact);
          break;
        }
      }
    }
  })

  // Return an array containing an item for each primary entity type
  return Object.keys(entityNameMap).map(entityName => entityNameMap[entityName]);
}

function deleteArtifact(artifactType, artifactName, artifactVersion = 'latest') {
    const artifactKey = generateArtifactKey(artifactType, artifactName, artifactVersion);
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);

    const node = getArtifactNode(artifactType, artifactName, artifactVersion);

    for (const db of artifactLibrary.getStorageDatabases()) {
        dataHub.hubUtils.deleteDocument(xdmp.nodeUri(node), db);
    }
    delete cachedArtifacts[artifactKey];
    return { success: true };
}

function getArtifact(artifactType, artifactName, artifactVersion = 'latest') {
    const artifactKey = generateArtifactKey(artifactType, artifactName, artifactVersion);
    if (!cachedArtifacts[artifactKey]) {
        const artifactLibrary =  getArtifactTypeLibrary(artifactType);
        const artifactNode = getArtifactNode(artifactType, artifactName, artifactVersion);
        cachedArtifacts[artifactKey] = artifactNode.toObject();
    }
    return cachedArtifacts[artifactKey];
}

function setArtifact(artifactType, artifactName, artifact) {
    const artifactKey = generateArtifactKey(artifactType, artifactName);
    let validArtifact = validateArtifact(artifactType, artifactName, artifact) || artifact;
    if (validArtifact instanceof Error) {
        throw new Error(`Invalid artifact with error message: ${validArtifact.message}`);
    }
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    const artifactDatabases = artifactLibrary.getStorageDatabases();
    const artifactDirectory = getArtifactDirectory(artifactType, artifactName, artifact);
    const artifactFileExtension = getArtifactFileExtension(artifactType);
    const artifactPermissions = artifactLibrary.getPermissions();
    const artifactCollections = artifactLibrary.getCollections();
    let existingArtifact;
    try {
        existingArtifact = getArtifactNode(artifactType, artifactName);
    } catch (e) {}
    if (fn.empty(existingArtifact) && artifactLibrary.defaultArtifact) {
        artifact = Object.assign({}, artifactLibrary.defaultArtifact(artifactName, artifact.targetEntityType), artifact);
    }

    artifact.lastUpdated = fn.string(fn.currentDateTime());
    dataHub.hubUtils.replaceLanguageWithLang(artifact);

    for (const db of artifactDatabases) {
        dataHub.hubUtils.writeDocument(`${artifactDirectory}${xdmp.urlEncode(artifactName)}${artifactFileExtension}`, artifact, artifactPermissions, artifactCollections, db);
    }
    cachedArtifacts[artifactKey] = artifact;

    return artifact;
}

function validateArtifact(artifactType, artifactName, artifact) {
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    const validatedArtifact = artifactLibrary.validateArtifact(artifact, artifactName);
    if (validatedArtifact instanceof Error) {
        returnErrToClient(400, 'BAD REQUEST', validatedArtifact.message);
    }
    return validatedArtifact;
}

function getArtifactNode(artifactType, artifactName, artifactVersion = 'latest') {
    const artifactLibrary = getArtifactTypeLibrary(artifactType);
    const node = artifactLibrary.getArtifactNode(artifactName, artifactVersion);
    if (fn.empty(node)) {
        returnErrToClient(404, 'NOT FOUND', `${artifactType} with name '${artifactName}' not found.`);
    }
    return node;
}

function getArtifactDirectory(artifactType, artifactName, artifact) {
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    return artifactLibrary.getDirectory ? artifactLibrary.getDirectory(artifactName, artifact): `/${artifactType}/`;
}

function getArtifactFileExtension(artifactType) {
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    return artifactLibrary.getFileExtension ? artifactLibrary.getFileExtension(): `.${artifactType}.json`;
}

function getArtifactTypeLibrary(artifactType) {
    const artifactLibrary = registeredArtifactTypes[artifactType];
    if (!artifactLibrary) {
        returnErrToClient(400, 'BAD REQUEST', `Invalid artifact type: ${artifactType}. Valid types: ${JSON.stringify(Object.keys(registeredArtifactTypes))}`)
    }
    return artifactLibrary;
}

function generateArtifactKey(artifactType, artifactName, artifactVersion = 'latest') {
    return `${artifactType}:${artifactName}:${artifactVersion}`;
}

function returnErrToClient(statusCode, statusMsg, body) {
    fn.error(null, 'RESTAPI-SRVEXERR',
        Sequence.from([statusCode, statusMsg, body]));
}

function getFullFlow(flowName, artifactVersion = 'latest') {
  const flow = getArtifact('flow', flowName);
  const steps = flow["steps"];
  Object.keys(steps).forEach(stepNumber => {
    if (steps[stepNumber].stepId) {
      steps[stepNumber] = convertStepReferenceToInlineStep(steps[stepNumber].stepId);
    }
  });
  return flow;
}

function removeNullProperties(obj) {
  var propNames = Object.getOwnPropertyNames(obj);
  for (var i = 0; i < propNames.length; i++) {
    var propName = propNames[i];
    if (obj[propName] === null || obj[propName] === undefined ) {
      delete obj[propName];
    }
  }
  return obj
}

function convertStepReferenceToInlineStep(stepId) {
  const stepDoc = fn.head(cts.search(cts.andQuery([
    cts.collectionQuery("http://marklogic.com/data-hub/steps"),
    cts.jsonPropertyValueQuery("stepId", stepId, "case-insensitive")
  ])));
  if (!stepDoc) {
    httpUtils.throwBadRequest(`Could not find a step with ID ${stepId}, which was referenced in flow ${flowName}`);
  }

  const referencedStep = removeNullProperties(stepDoc.toObject());

  const newFlowStep = {};

  // Convert ingestion-specific properties into a fileLocations object
  if ("ingestion" === referencedStep.stepDefinitionType.toLowerCase()) {
    const fileLocations = {};
    if (referencedStep.sourceFormat) {
      fileLocations.inputFileType = referencedStep.sourceFormat;
      delete referencedStep.sourceFormat;
    }
    ["inputFilePath", "outputURIReplacement", "outputURIPrefix", "separator"].forEach(prop => {
      if (referencedStep.hasOwnProperty(prop)) {
        fileLocations[prop] = referencedStep[prop];
        delete referencedStep[prop];
      }
    });
    if (Object.keys(fileLocations).length > 0) {
      newFlowStep.fileLocations = fileLocations;
    }
  }

  // Transfer mapping properties into a mapping reference
  if (referencedStep.stepDefinitionType && "mapping" == referencedStep.stepDefinitionType.toLowerCase()) {
    const mapping = {
      name: referencedStep.name
    };
    if (referencedStep.version) {
      mapping.version = referencedStep.version;
      delete referencedStep.version;
    }
    referencedStep.mapping = mapping;
    delete referencedStep.properties;
  }

  // Copy all known non-options properties over
  [
    "name", "description", "stepDefinitionName", "stepDefinitionType", "stepId",
    "customHook", "processors", "batchSize", "threadCount"
  ].forEach(key => {
    if (referencedStep[key] === "" || referencedStep[key]) {
      newFlowStep[key] = referencedStep[key];
      delete referencedStep[key];
    }
  });

  // Convert targetFormat into outputFormat
  if (referencedStep.targetFormat) {
    referencedStep.outputFormat = referencedStep.targetFormat;
    delete referencedStep.targetFormat;
  }

  // Combine collections and additionalCollections
  let collections = referencedStep.collections || [];
  if (referencedStep.additionalCollections) {
    collections = collections.concat(referencedStep.additionalCollections);
    delete referencedStep.additionalCollections;
  }
  if (collections.length > 0) {
    referencedStep.collections = collections;
  }
  const propsNotToBeCopiedToOptions = ["lastUpdated", "selectedSource"]
  // Copy all remaining properties on the referenced step that are not in 'propsNotToBeCopiedToOptions' as options
  newFlowStep.options = {};
  Object.keys(referencedStep).forEach(key => {
    if(! propsNotToBeCopiedToOptions.includes(key)) {
      newFlowStep.options[key] = referencedStep[key];
    }
  });

  return newFlowStep;
}

module.exports = {
    getArtifacts,
    deleteArtifact,
    getArtifact,
    setArtifact,
    validateArtifact,
    getFullFlow,
    convertStepReferenceToInlineStep
};
