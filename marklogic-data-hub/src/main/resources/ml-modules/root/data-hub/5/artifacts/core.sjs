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

const LoadData = require('./loadData');
const Flow = require('./flow');
const StepDef = require('./stepDefinition');
const Mapping = require('./mapping');
const Matching = require('./matching');

const DataHubSingleton = require('/data-hub/5/datahub-singleton.sjs');
const dataHub = DataHubSingleton.instance();
// define constants for caching expensive operations
const cachedArtifacts = {};
const registeredArtifactTypes = {
    loadData: LoadData,
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
const artifactsWithSettings = ['loadData'].concat(entityServiceDrivenArtifactTypes)

function getArtifacts(artifactType) {
    const queries = [];
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    for (const coll of artifactLibrary.getCollections()) {
        queries.push(cts.collectionQuery(coll));
    }
    if (queries.length) {
        if (entityServiceDrivenArtifactTypes.includes(artifactType)) {
          return getArtifactsGroupByEntity(queries)
        } else {
          return cts.search(cts.andQuery(queries)).toArray();
        }
    }
    return [];
}

function getArtifactsGroupByEntity(queries) {
    const entityNames = getEntityTitles();
    const artifacts = cts.search(cts.andQuery(queries.concat(cts.jsonPropertyValueQuery("targetEntityType", entityNames)))).toArray();
    const artifactsByEntity = artifacts.map(e => e.toObject()).reduce((res, e) => {
            res[e.targetEntityType] = res[e.targetEntityType] || {entityType : e.targetEntityType};
            res[e.targetEntityType].artifacts = res[e.targetEntityType].artifacts || [];
            res[e.targetEntityType].artifacts.push(e);
            return res;
        }, {});

    const entityWithoutArtifacts = [];
    for (const ename of entityNames) {
        if (!artifactsByEntity[ename]) {
            entityWithoutArtifacts.push(ename);
        }
    }
    const allArtifactsByEntity = Object.keys(artifactsByEntity).map(e => artifactsByEntity[e]);
    for (const e of entityWithoutArtifacts) {
        allArtifactsByEntity.push({entityType : e, artifacts : []});
    }
    return allArtifactsByEntity;
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
    artifact.lastUpdated = fn.string(fn.currentDateTime());
    dataHub.hubUtils.replaceLangWithLanguage(artifact);
    for (const db of artifactDatabases) {
        dataHub.hubUtils.writeDocument(`${artifactDirectory}${xdmp.urlEncode(artifactName)}${artifactFileExtension}`, artifact, artifactPermissions, artifactCollections, db);
    }
    cachedArtifacts[artifactKey] = artifact;

  //Create settings artifact if they are not present, happens only when creating the artifact.
    if (artifactsWithSettings.includes(artifactType)) {
      try {
        getArtifactSettings(artifactType, artifactName);
      } catch (ex) {
        let settings = artifactLibrary.defaultArtifactSettings(artifactName);
        setArtifactSettings(artifactType, artifactName, settings);
      }
    }
    return artifact;
}

function getArtifactSettings(artifactType, artifactName, artifactVersion = 'latest') {
    const artifactSettingKey = generateArtifactKey(artifactType + 'Settings', artifactName);
    if (!cachedArtifacts[artifactSettingKey]) {
        const artifactLibrary = getArtifactTypeLibrary(artifactType);
        const settingCollection = `http://marklogic.com/data-hub/${artifactType}/settings`;

        const settingNode = artifactLibrary.getArtifactSettingNode(settingCollection, artifactName, artifactVersion);

        if (fn.empty(settingNode)) {
          returnErrToClient(404, 'NOT FOUND');
        }
        cachedArtifacts[artifactSettingKey] = settingNode.toObject();
    }
    return cachedArtifacts[artifactSettingKey];
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

function getEntityTitles() {
    return cts.search(cts.collectionQuery("http://marklogic.com/entity-services/models")).toArray().map(e => e.xpath("//info//title"));
}

function getFullFlow(flowName, artifactVersion = 'latest') {
  let flowNode = getArtifact('flow', flowName);
  flowNode = createFullFlow(flowName, flowNode);
  return flowNode;
}

function createFullFlow(flowName, flowNode){
  const steps = flowNode["steps"];
  Object.keys(steps).forEach(key => {
    let stepValue = steps[key];
    let artifactInStepType = stepValue['stepDefinitionType'].toLowerCase() === "ingestion" ? "loadData" : stepValue['stepDefinitionType'].toLowerCase();
    if(stepValue.options[artifactInStepType]){
      let artifactInStep =  stepValue.options[artifactInStepType].name;
      try {
        let settingsNode = getArtifactSettings(artifactInStepType, artifactInStep)
        delete settingsNode["artifactName"];
        settingsNode = clean(settingsNode);
        let artifactNode = getArtifact(artifactInStepType, artifactInStep);
        stepValue = addToStep(artifactInStepType,stepValue, artifactNode, settingsNode);
        stepValue = addToStepOptions(artifactInStepType, stepValue, artifactNode, settingsNode);
      }
      catch (ex) {
        if(artifactInStepType == 'mapping') {
          dataHub.debug.log({message: 'This flow ' + flowName + ' runs older version of  mapping: ' + artifactInStep , type: 'warning'})
        }
        else {
          throw Error('Getting flow ' + flowName + ' failed: Unable to get settings for the artifact : ' +  artifactInStep);
        }
      }
    }
  });
  return flowNode;
}

//TODO: Add 'processors' to step once it is known where they will go into (artifact or settings)
function addToStep(artifactInStepType, stepValue, artifactNode,  settingsNode){
  if(artifactInStepType === 'loadData') {
    stepValue.fileLocations = {};
    stepValue.fileLocations.inputFilePath =   artifactNode["inputFilePath"];
    stepValue.fileLocations.outputURIReplacement =   artifactNode["outputURIReplacement"];
    stepValue.fileLocations.inputFileType =   artifactNode["sourceFormat"];
    stepValue.fileLocations.separator =   artifactNode["separator"];
  }
  else {
      stepValue.options["sourceQuery"] = artifactNode["sourceQuery"];
    }
  stepValue.customHook = settingsNode.customHook;
  delete settingsNode.customHook;
  return stepValue;
}

function addToStepOptions(artifactInStepType, stepValue, artifactNode,  settingsNode) {
  if(artifactInStepType === 'loadData') {
    stepValue.options["outputFormat"] = artifactNode["targetFormat"];
  }
  else {
    stepValue.options["outputFormat"] = settingsNode["targetFormat"];
    delete settingsNode['targetFormat'];
  }
  stepValue.options = Object.assign(stepValue.options, settingsNode);
  stepValue.options.collections = stepValue.options.collections ? stepValue.options.collections : [];
  stepValue.options.collections = stepValue.options.additionalCollections ? stepValue.options.collections.concat(stepValue.options.additionalCollections) : stepValue.options.collections
  return stepValue;
}

function clean(obj) {
  var propNames = Object.getOwnPropertyNames(obj);
  for (var i = 0; i < propNames.length; i++) {
    var propName = propNames[i];
    if (obj[propName] === null || obj[propName] === undefined ) {
      delete obj[propName];
    }
  }
  return obj
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
    getEntityTitles,
    linkToStepOptions,
    removeLinkToStepOptions,
    getFullFlow
};
