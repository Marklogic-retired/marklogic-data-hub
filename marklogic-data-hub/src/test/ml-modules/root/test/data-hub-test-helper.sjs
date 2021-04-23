/*
Contains helper functions that are best written in SJS instead of XQuery.
 */

'use strict';

const Artifacts = require("/data-hub/5/artifacts/core.sjs");
const config = require("/com.marklogic.hub/config.sjs");
const entityLib = require("/data-hub/5/impl/entity-lib.sjs");
const hubTest = require("/test/data-hub-test-helper.xqy");
const test = require("/test/test-helper.xqy");

function runWithRolesAndPrivileges(roles, privileges, funOrModule, variables)
{
    hubTest.assertCalledFromTest();
    const securityOptions = { "defaultXqueryVersion": "1.0-ml", "database": xdmp.securityDatabase() };
    try {
        xdmp.invoke("/test/invoke/create-test-role.xqy", {"roles": Sequence.from(roles), "privileges": Sequence.from(privileges)}, securityOptions);
    } catch (e) {
        throw e;
    }
    const userId = fn.head(xdmp.invoke("/test/invoke/create-test-user.xqy", {}, securityOptions));
    const cleanUp = function() {
        try {
            xdmp.invoke("/test/invoke/delete-test-role.xqy", {},securityOptions);
        } catch (e) {
        }
        try {
            xdmp.invoke("/test/invoke/delete-test-user.xqy", {}, securityOptions);
        } catch (e) {
        }
    }
    let execute;
    try {
        if (funOrModule instanceof Function || typeof funOrModule === 'function') {
            execute = xdmp.invokeFunction(funOrModule, {userId});
        } else {
            execute = xdmp.invoke(funOrModule, variables, {userId});
        }
    } catch (e) {
        cleanUp();
        throw e;
    }
    cleanUp();
    return execute;
}

function verifyJson(expectedObject, actualObject, assertions) {
  Object.keys(expectedObject).forEach(key => {
    const expectedValue = expectedObject[key];
    if (Array.isArray(expectedValue)) {
      assertions.push(hubTest.assertArraysEqual(expectedValue, actualObject[key]));
    } else {
      assertions.push(test.assertEqual(expectedValue, actualObject[key]));
    }
  });
}

/**
 * Helper function for when you want a "Record" object that contains the URI, document, and metadata. Feel free to
 * add new keys to this object as needed. Note that collections and permissions are sorted to allow for reliable
 * assertions on specific indexes in the arrays.
 *
 * @param uri
 * @param databaseName optional, defaults to database the test is running against
 * @returns {*|this|this}
 */
function getRecord(uri, databaseName = null) {
  databaseName = databaseName || xdmp.databaseName(xdmp.database());
  return fn.head(xdmp.invokeFunction(function() {
    if (!fn.docAvailable(uri)) {
      throw Error(`Did not find document with URI: ${uri}; database: ${databaseName}`);
    }
    const doc = cts.doc(uri);
    // If the doc is an XML document, toObject results in undefined
    const document = doc.toObject() ? doc.toObject() : doc;
    return {
      uri : uri.toString(),
      document : document,
      collections : xdmp.documentGetCollections(uri).sort(),
      permissions : buildPermissionsMap(xdmp.documentGetPermissions(uri)),
      metadata : xdmp.documentGetMetadata(uri)
    }
  }, {database: xdmp.database(databaseName)}));
}

function getStagingRecord(uri) {
  return getRecord(uri, config.STAGINGDATABASE);
}

function getModulesRecord(uri) {
  return getRecord(uri, config.MODULESDATABASE);
}

function getJobRecord(jobId) {
  return getRecord("/jobs/" + jobId + ".json", config.JOBDATABASE);
}

function getFirstBatchRecord() {
  const uri = getUriInCollection("Batch", config.JOBDATABASE);
  return getRecord(uri, config.JOBDATABASE);
}

/**
 * Intended for the common use case of - I know my test module just did something that resulted in one document being
 * written to a certain collection, so gimme back a Record for that document.
 *
 * @param collection
 * @param databaseName
 * @returns {*|*}
 */
function getRecordInCollection(collection, databaseName) {
  if (!databaseName) {
    databaseName = xdmp.databaseName(xdmp.database());
  }
  const uri = getUriInCollection(collection, databaseName);
  return getRecord(uri, databaseName);
}

function getUriInCollection(collection, databaseName) {
  const uris = xdmp.eval(
    'cts.uris(null, null, cts.collectionQuery("' + collection + '"))', {},
    { database: xdmp.database(databaseName) }
  ).toArray();
  if (uris.length != 1) {
    throw Error("Expected single document to be in collection: " + collection);
  }
  return uris[0];
}

function getUrisInCollection(collection){
  return fn.head(xdmp.eval('cts.uris(null, null, cts.collectionQuery("'+ collection+ '")).toArray()'));
}

function stagingDocumentExists(uri) {
  return documentExists(uri, config.STAGINGDATABASE);
}

function finalDocumentExists(uri) {
  return documentExists(uri, config.FINALDATABASE);
}

function documentExists(uri, databaseName) {
  return fn.head(xdmp.eval(`fn.docAvailable('${uri}')`, {}, { database: xdmp.database(databaseName) }));
}

/**
 * For many scenarios, it'll be sufficient to just verify the count of provenance docs - i.e. was the expected number
 * created, or were no docs created. 
 */
function getProvenanceCount() {
  return fn.head(xdmp.invokeFunction(function() {
    return cts.estimate(cts.collectionQuery("http://marklogic.com/provenance-services/record"));
  }, {database: xdmp.database(config.JOBDATABASE)}));
}

/**
 * Makes life easy for verifying permissions by building a map of them, keyed on role name, with arrays of capabilities
 * as values.
 *
 * @param permissions
 * @returns {{}}
 */
function buildPermissionsMap(permissions) {
  const map = {};
  permissions.forEach(perm => {
    const roleName = xdmp.roleName(perm.roleId);
    if (map[roleName]) {
      map[roleName].push(perm.capability);
    } else {
      map[roleName] = [perm.capability];
    }
  })
  Object.keys(map).forEach(key => map[key].sort());
  return map;
}

/**
 * Convenience function for setting up a project with a simple Customer entity model and a flow consisting of the 
 * given steps.
 * 
 * @param arrayOfStepProperties 
 */
function createSimpleProject(flowName, arrayOfStepProperties) {
  // Must invoke this in a separate transaction so that steps can see the model
  xdmp.invokeFunction(function() {
    declareUpdate();
    entityLib.writeModel("Customer", {
      "info": {
        "title": "Customer",
        "version": "0.0.1",
        "baseUri": "http://example.org/"
      },
      "definitions": {
        "Customer": {
          "properties": {
            "customerId": {"datatype": "integer"},
            "name": {"datatype": "string"},
            "nicknames":{"datatype": "array", "items":{"datatype": "string"}},
            "status": {"datatype": "string"},
            "integers":{"datatype": "array", "items":{"datatype": "integer"}}
          }
        }
      }
    });
  });

  const flow = {
    "name": flowName,
    "steps": {}
  };

  let index = 1;
  arrayOfStepProperties.forEach(stepProps => {
    if (!stepProps.name) {
      stepProps.name = "step" + index;
    }
    const stepType = stepProps.stepDefinitionType.toLowerCase();
    if (!stepProps.stepId) {
      stepProps.stepId = stepProps.name.toLowerCase() + "-" + stepType;
    }
    Artifacts.setArtifact(stepType, stepProps.name, stepProps);
    flow.steps["" + index] = {"stepId": stepProps.stepId};
    index++;
  });

  Artifacts.setArtifact("flow", flow.name, flow);
}

/**
 * Convenience function for setting up a project with a simple Customer entity model, one or more mapping steps, and a flow that
 * references those mapping steps. Each mapping step is based on the makeSimpleMappingStep function.
 *
 * @param arrayOfMappingStepProperties one or more objects, where each is combined with the output of the makeSimpleMappingStep
 * function to create a new mapping step
 */
function createSimpleMappingProject(arrayOfMappingStepProperties) {
  let index = 1;
  const stepProps = arrayOfMappingStepProperties.map(mappingProps => {
    return makeSimpleMappingStep("mappingStep" + index++, mappingProps);
  });
  createSimpleProject("simpleMappingFlow", stepProps);
}

function makeSimpleMappingStep(stepName, mappingStepProperties) {
  const initialMappingStep = {
    "name": stepName,
    "stepId": stepName + "-mapping",
    "stepDefinitionName": "entity-services-mapping",
    "stepDefinitionType": "MAPPING",
    "selectedSource": "query",
    "sourceQuery": "cts.collectionQuery('customer-input')",
    "sourceDatabase": "data-hub-STAGING",
    "targetDatabase": "data-hub-FINAL",
    "collections": ["Customer"],
    "permissions": "data-hub-common,read,data-hub-common,update",
    "targetFormat": "json",
    "targetEntityType": "http://example.org/Customer-0.0.1/Customer",
    "properties": {
      "customerId": {"sourcedFrom": "customerId"},
      "name": {"sourcedFrom": "name"},
      "status": {"sourcedFrom": "status"}
    },
    "provenanceGranularityLevel": "off"
  };

  return Object.assign({}, initialMappingStep, mappingStepProperties);
}

module.exports = {
  createSimpleProject,
  createSimpleMappingProject,
  finalDocumentExists,
  getFirstBatchRecord,
  getJobRecord,
  getModulesRecord,
  getProvenanceCount,
  getRecord,
  getRecordInCollection,
  getStagingRecord,
  makeSimpleMappingStep,
  stagingDocumentExists,
  verifyJson,
  getUrisInCollection,
  runWithRolesAndPrivileges: module.amp(runWithRolesAndPrivileges)
};
