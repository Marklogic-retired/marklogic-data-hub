// Uses the Data Hub test helper library to prepare the staging, final, and job databases before each test module is run.
// If you need this functionality instead at the suite level, just remove the code below and modify the generated suiteSetup.sjs file.
// If you do not need this functionality, it is safe to delete the code below and/or this module.

declareUpdate();
const dhmut = require('/data-hub/public/marklogic-unit-test/hub-test-helper.xqy');
dhmut.prepareDatabases();