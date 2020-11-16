'use strict';

const test = require("/test/test-helper.xqy");

// Utils for getDocumentForTesting's tests.
const DocumentForTestingUtils = {
  STEP_NAME: 'prospect2CustomerMappingStep',
  DATABASE_NAME: 'data-hub-FINAL',
  // Load data not provided via test-data directory.
  loadTestData: function () {
    // Found it difficult to figure out how to load a mapping step via test-data directory and get it into the collection
    // required by mapping.sjs' getArtifactNode().  Going this route instead.
    const stepService = require("./stepService.sjs");
    stepService.createDefaultMappingStep(DocumentForTestingUtils.STEP_NAME);
    stepService.saveStep('mapping',{
      name: DocumentForTestingUtils.STEP_NAME,
      sourceDatabase: DocumentForTestingUtils.DATABASE_NAME,
      sourceQuery: 'cts.collectionQuery("raw-content")'
    });
  },
  invokeService: function (stepName, uri) {
    return fn.head(require("/test/data-hub-test-helper.sjs").runWithRolesAndPrivileges(['hub-central-mapping-reader'], [],
      "/data-hub/5/data-services/mapping/getDocumentForTesting.sjs", {stepName, uri}
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

module.exports = {
  DocumentForTestingUtils
}
