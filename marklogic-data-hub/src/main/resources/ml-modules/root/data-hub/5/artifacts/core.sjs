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
const StepDef = require('./stepDefinition');

const ds = require("/data-hub/5/data-services/ds-utils.sjs");
const DataHubSingleton = require('/data-hub/5/datahub-singleton.sjs');
const dataHub = DataHubSingleton.instance();

// define constants for caching expensive operations
const cachedArtifacts = {};
const registeredArtifactTypes = {
  ingestion: LoadData,
    flow: Flow,
    stepDefinition: StepDef,
    mapping: Mapping,
    matching: Matching
};

function getTypesInfo() {
    const typesInfo = [];
    for (const artifactType of Object.keys(registeredArtifactTypes)) {
        if (registeredArtifactTypes.hasOwnProperty(artifactType)) {
            const artifactLibrary = registeredArtifactTypes[artifactType];
            const updateRoles = artifactLibrary.getPermissions().filter((perm) => perm.capability === 'update').map((perm) => String(perm.roleId));
            const readRoles = artifactLibrary.getPermissions().filter((perm) => perm.capability === 'read').map((perm) => String(perm.roleId));
            const currentRoles = xdmp.getCurrentRoles().toArray().map(String);
            const manageAdminRolesMustAllMatched = ['manage-admin', 'security'].map((roleName) => String(xdmp.role(roleName)));
            const hasManageAdminAndSecurity = manageAdminRolesMustAllMatched.every((role) => currentRoles.indexOf(role) !== -1);
            let currentRoleNames = currentRoles.map(roleId => xdmp.roleName(roleId));
            let userCanUpdate = false;
            if (currentRoleNames.includes('admin') || hasManageAdminAndSecurity) {
                userCanUpdate = true;
            } else {
                userCanUpdate = updateRoles.some((roleId) => currentRoles.includes(roleId));
            }
            const userCanRead = readRoles.some((roleId) => currentRoles.includes(roleId));
            typesInfo.push({
                type: artifactType,
                fileExtension: getArtifactFileExtension(artifactType),
                directory: getArtifactDirectory(artifactType),
                nameProperty: artifactLibrary.getNameProperty(),
                versionProperty: artifactLibrary.getVersionProperty(),
                userCanUpdate: userCanUpdate,
                userCanRead: userCanRead
            });
        }
    }
    return typesInfo;
}

const entityServiceDrivenArtifactTypes = ['mapping', 'matching', 'merging', 'mastering'];
const artifactsWithSettings = ['matching', 'merging', 'mastering'];

function getArtifacts(artifactType) {
    const queries = [];
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);

    // This is a temporary hack during the shift to mapping steps; it ensures that mapping.sjs can specify multiple
    // collections, but only the first one is used for finding artifacts so that ./mappings mappings are still found.
    const artifactCollections = artifactLibrary.getCollections();
    if (artifactCollections != null && artifactCollections.length > 0) {
      queries.push(cts.collectionQuery(artifactCollections[0]));
    }

    if (queries.length) {
      // Since these are user-specific artifacts, hub artifacts (flows and step definitions) are excluded
      queries.push(cts.notQuery(cts.collectionQuery(dataHub.consts.HUB_ARTIFACT_COLLECTION)));

      if (entityServiceDrivenArtifactTypes.includes(artifactType)) {
        return getArtifactsGroupByEntity(queries)
      } else {
        return cts.search(cts.andQuery(queries)).toArray();
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
    queries.concat(cts.jsonPropertyValueQuery("targetEntityType", entityNamesAndTypeIds))
  )).toArray();

  // Figure out where each artifact goes in the entityNameMap
  const artifactMap = {};
  artifacts.forEach(artifact => {
    artifact = artifact.toObject();
    const targetEntityType = artifact.targetEntityType;
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

    // Currently there is no versioning for loadData artifacts
    const node = getArtifactNode(artifactType, artifactName, artifactVersion);

    for (const db of artifactLibrary.getStorageDatabases()) {
        dataHub.hubUtils.deleteDocument(xdmp.nodeUri(node), db);
    }
    delete cachedArtifacts[artifactKey];
    if (artifactLibrary.getArtifactSettingNode) {
        return deleteArtifactSettings(artifactType, artifactName, artifactVersion);
    }
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
    dataHub.hubUtils.replaceLangWithLanguage(artifact);
    for (const db of artifactDatabases) {
        dataHub.hubUtils.writeDocument(`${artifactDirectory}${xdmp.urlEncode(artifactName)}${artifactFileExtension}`, artifact, artifactPermissions, artifactCollections, db);
    }
    cachedArtifacts[artifactKey] = artifact;

  //Create settings artifact if they are not present, happens only when creating the artifact.
  if (artifactsWithSettings.includes(artifactType) && fn.empty(getArtifactSettingsNode(artifactType,artifactName))) {
    let settings = artifactLibrary.defaultArtifactSettings(artifactName, artifact.targetEntityType);
    setArtifactSettings(artifactType, artifactName, settings);
  }
    return artifact;
}

function getArtifactSettings(artifactType, artifactName, artifactVersion = 'latest') {
    const artifactSettingKey = generateArtifactKey(artifactType + 'Settings', artifactName);
    if (!cachedArtifacts[artifactSettingKey]) {
        const settingNode = getArtifactSettingsNode(artifactType, artifactName, artifactVersion);

        if (fn.empty(settingNode)) {
          returnErrToClient(404, 'NOT FOUND');
        }
        cachedArtifacts[artifactSettingKey] = settingNode.toObject();
    }
    return cachedArtifacts[artifactSettingKey];
}

function getArtifactSettingsNode(artifactType, artifactName, artifactVersion = 'latest') {
    const settingCollection = `http://marklogic.com/data-hub/${artifactType}/settings`;
    const results = cts.search(cts.andQuery([cts.collectionQuery(settingCollection), cts.jsonPropertyValueQuery('artifactName', artifactName)]));
    return fn.head(results);
}

function setArtifactSettings(artifactType, artifactName, settings) {
    const requiredProperties = ['artifactName', 'targetDatabase'];
    let validSettings = validateArtifactSettings(settings, requiredProperties);
    if (validSettings instanceof Error) {
        throw new Error(`Invalid artifact settings with error message: ${validSettings.message}`);
    }
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    const artifactDatabases = artifactLibrary.getStorageDatabases();
    const artifactDirectory = getArtifactDirectory(artifactType, artifactName, settings);
    const artifactFileExtension = '.settings.json';
    const artifactPermissions = artifactLibrary.getPermissions();
    const settingCollections = [`http://marklogic.com/data-hub/${artifactType}/settings`];
    settings.lastUpdated = fn.string(fn.currentDateTime());

    for (const db of artifactDatabases) {
        dataHub.hubUtils.writeDocument(`${artifactDirectory}${xdmp.urlEncode(artifactName)}${artifactFileExtension}`, settings, artifactPermissions, settingCollections, db);
    }
    const artifactSettingKey = generateArtifactKey(artifactType + 'Settings', artifactName);
    cachedArtifacts[artifactSettingKey] = settings;
    return settings;
}

function validateArtifact(artifactType, artifactName, artifact) {
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    const validatedArtifact = artifactLibrary.validateArtifact(artifact, artifactName);
    if (validatedArtifact instanceof Error) {
        returnErrToClient(400, 'BAD REQUEST', validatedArtifact.message);
    }
    return validatedArtifact;
}

function linkToStepOptions(flowName, stepID, artifactType, artifactName, artifactVersion = 'latest') {
    return linkToStepOptionsOperation('addLink', flowName, stepID, artifactType, artifactName, artifactVersion);
}

function removeLinkToStepOptions(flowName, stepID, artifactType, artifactName, artifactVersion = 'latest') {
    return linkToStepOptionsOperation('removeLink', flowName, stepID, artifactType, artifactName, artifactVersion);
}

function linkToStepOptionsOperation(operation, flowName, stepID, artifactType, artifactName, artifactVersion = 'latest') {
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    // getting artifact object so 404 will be thrown if artifact isn't found
    // also, we can have the extension library handle latest version logic, if necessary
    const artifactObject = getArtifactNode(artifactType, artifactName, artifactVersion).toObject();
    artifactVersion = artifactLibrary.getVersionProperty() ? artifactObject[artifactLibrary.getVersionProperty()] : artifactVersion;


    const flowDatabases =  getArtifactTypeLibrary('flow').getStorageDatabases();
    const flowNode = getArtifactNode('flow', flowName);
    const stepName = stepID.substring(0, stepID.lastIndexOf('-'));
    const stepType = stepID.substring(stepID.lastIndexOf('-') + 1).toLowerCase();
    const stepOptionsXPath = dataHub.hubUtils.xquerySanitizer`/steps/*[name eq "${stepName}"][lower-case(stepDefinitionType) eq "${stepType}"]/options`;
    const stepOptionsNode = fn.head(flowNode.xpath(stepOptionsXPath));
    if (fn.empty(stepOptionsNode)) {
        returnErrToClient(404, 'NOT FOUND', `Step "${stepID}" options of flow "${flowName}" not found!`);
    }
    let stepOptionsObject = stepOptionsNode.toObject();
    if (operation === 'addLink') {
        if (artifactLibrary.linkToOptions) {
            stepOptionsObject = artifactLibrary.linkToOptions(stepOptionsObject, artifactName, artifactVersion);
        } else {
            stepOptionsObject = defaultArtifactLinkFunction(artifactType, stepOptionsObject, artifactName, artifactVersion);
        }
    } else if (operation === 'removeLink') {
        if (artifactLibrary.removeLinkToOptions) {
            stepOptionsObject = artifactLibrary.removeLinkToOptions(stepOptionsObject, artifactName, artifactVersion);
        } else {
            stepOptionsObject = defaultRemoveArtifactLinkFunction(artifactType, stepOptionsObject, artifactName, artifactVersion);
        }
    }
    const flowURI = xdmp.nodeUri(flowNode);
    for (const db of flowDatabases) {
        dataHub.hubUtils.updateNodePath(flowURI, stepOptionsXPath, stepOptionsObject, db);
    }
    // returning the updated flow object so the file can be updated in the project directory
    const flowObject = flowNode.toObject();
    const stepNumber = fn.string(fn.nodeName(stepOptionsNode.xpath('..')));
    flowObject.steps[stepNumber].options = stepOptionsObject;
    return flowObject;
}

function defaultArtifactLinkFunction(artifactType, existingOptions, artifactName, artifactVersion) {
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    const linkObject = {
        [artifactLibrary.getNameProperty()]: artifactName
    };
    const versionProperty = artifactLibrary.getVersionProperty();
    if (versionProperty)  {
        linkObject[versionProperty] = artifactVersion;
    }
    existingOptions[artifactType] = linkObject;
    return existingOptions;
}

function defaultRemoveArtifactLinkFunction(artifactType, existingOptions, artifactName, artifactVersion) {
    delete existingOptions[artifactType];
    return existingOptions;
}

function getArtifactNode(artifactType, artifactName, artifactVersion = 'latest') {
    const artifactLibrary = getArtifactTypeLibrary(artifactType);
    const node = artifactLibrary.getArtifactNode(artifactName, artifactVersion);
    if (fn.empty(node)) {
        returnErrToClient(404, 'NOT FOUND');
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

function validateArtifactSettings(settings, requiredProperties) {
    const missingProperties = requiredProperties.filter((propName) => !settings[propName]);
    if (missingProperties.length) {
        return new Error(`Missing the following required properties: ${JSON.stringify(missingProperties)}`);
    }
    return settings;
}

function deleteArtifactSettings(artifactType, artifactName, artifactVersion = 'latest') {
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    const settingCollection = `http://marklogic.com/data-hub/${artifactType}/settings`;

    const settingNode = artifactLibrary.getArtifactSettingNode(settingCollection, artifactName,
        artifactVersion);

    if (!fn.empty(settingNode)) {
        for (const db of artifactLibrary.getStorageDatabases()) {
            dataHub.hubUtils.deleteDocument(xdmp.nodeUri(settingNode), db);
        }
    }

    const artifactSettingKey = generateArtifactKey(artifactType + 'Settings',
        artifactName);
    if (cachedArtifacts[artifactSettingKey]) {
        delete cachedArtifacts[artifactSettingKey];
    }
    return { success: true };
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
    ds.throwServerError(`Could not find a step with ID ${stepId}, which was referenced in flow ${flowName}`);
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
    ["inputFilePath", "outputURIReplacement", "separator"].forEach(prop => {
      if (referencedStep[prop]) {
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
    if (referencedStep[key]) {
      newFlowStep[key] = referencedStep[key];
      delete referencedStep[key];
    }
  });

  // Convert targetFormat into outputFormat
  // TODO Ideally, HC will adopt the term "outputFormat" so that this is not needed
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

  // Copy all remaining properties on the referenced step over as options
  newFlowStep.options = {};
  Object.keys(referencedStep).forEach(key => {
    newFlowStep.options[key] = referencedStep[key];
  });

  return newFlowStep;
}

module.exports = {
    getTypesInfo,
    getArtifacts,
    deleteArtifact,
    getArtifact,
    setArtifact,
    getArtifactSettings,
    setArtifactSettings,
    validateArtifact,
    linkToStepOptions,
    removeLinkToStepOptions,
    getFullFlow
};
