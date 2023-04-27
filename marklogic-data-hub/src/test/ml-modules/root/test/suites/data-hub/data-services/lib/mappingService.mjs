'use strict';

import stepService from "./stepService.mjs";
import hubTest from "/test/data-hub-test-helper.mjs";

const test = require("/test/test-helper.xqy");
// Utils for getDocument's tests.
export const DocumentForTestingUtils = {
  STEP_NAME1: 'prospect2CustomerMappingStep',
  STEP_NAME2: 'prospectRecordSourceCustomerMappingStep',
  DATABASE_NAME: 'data-hub-FINAL',
  // Load data not provided via test-data directory.
  loadTestData: function () {
    // Found it difficult to figure out how to load a mapping step via test-data directory and get it into the collection
    // required by mapping.sjs' getArtifactNode().  Going this route instead.
    stepService.createDefaultMappingStep(DocumentForTestingUtils.STEP_NAME1);
    stepService.updateStep('mapping',{
      name: DocumentForTestingUtils.STEP_NAME1,
      sourceDatabase: DocumentForTestingUtils.DATABASE_NAME,
      sourceQuery: 'cts.collectionQuery("raw-content")'
    });
    stepService.createDefaultMappingStep(DocumentForTestingUtils.STEP_NAME2);
    stepService.updateStep('mapping',{
      name: DocumentForTestingUtils.STEP_NAME2,
      sourceDatabase: DocumentForTestingUtils.DATABASE_NAME,
      sourceRecordScope: 'entireRecord',
      sourceQuery: 'cts.collectionQuery("raw-content")'
    });
  },
  invokeService: function (stepName, uri) {
    return fn.head(hubTest.runWithRolesAndPrivileges(['hub-central-mapping-reader'], [],
      "/data-hub/data-services/mapping/getDocument.mjs", {stepName, uri}
    ));
  },
  // May return zero or more.
  getSourcePropertiesByName: function (sourceProperties, name) {
    const matches = [];
    if (Array.isArray(sourceProperties)) {
      for (let property of sourceProperties) {
        if (name === property.name) {
          matches.push(property);
        }
      }
    }
    return matches;
  },
  // This function does not evaluate XPath expressions; rather, a string comparison is performed.
  getSourcePropertyByXPath: function (sourceProperties, xpath) {
    let winner = null;
    if (Array.isArray(sourceProperties)) {
      for (let property of sourceProperties) {
        if (xpath === property.xpath) {
          winner = property;
          break;
        }
      }
    }
    return winner;
  },
  addSourcePropertyAssertions: function (assertions, sourceProperties, name, xpath, struct, level) {
    const property = this.getSourcePropertyByXPath(sourceProperties, xpath);
    if (!property) {
      assertions.push(test.fail(`No source property with XPath of "${xpath}" in ${JSON.stringify(sourceProperties)}`));
    }

    assertions.push(test.assertEqual(name, property.name, `Unexpected "name" value for the source property with the "${xpath}" xpath`));
    assertions.push(test.assertTrue(struct === property.struct, `Expected ${struct} for the "struct" value for the source property with the "${xpath}" xpath but got ${property.struct}`));
    assertions.push(test.assertEqual(level, property.level, `Unexpected "level" value for the source property with the "${xpath}" xpath`));
  }
}

export default {
  DocumentForTestingUtils
}
