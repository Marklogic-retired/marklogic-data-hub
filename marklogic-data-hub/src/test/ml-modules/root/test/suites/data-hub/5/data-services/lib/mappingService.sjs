'use strict';

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
  }
}

module.exports = {
  DocumentForTestingUtils
}
