const config = require("/com.marklogic.hub/config.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
const hubTestXqy = require("/test/data-hub-test-helper.xqy");
const test = require("/test/test-helper.xqy");
const provenanceService = require("../../lib/provenanceService.sjs");

const assertions = [];

function migrateProvAsOperator() {
  hubTest.runWithRolesAndPrivileges(['data-hub-operator', 'ps-user'], [], function() {
    provenanceService.migrateProvenance({}, {});
  });
}

assertions.push(test.assertEqual(0, hubTest.getProvenanceCount(config.STAGINGDATABASE), "There should be 0 provenance documents in the Staging database"));
assertions.push(test.assertEqual(0, hubTest.getProvenanceCount(config.FINALDATABASE), "There should be 0 provenance documents in the Staging database"));
assertions.push(test.assertEqual(5, hubTest.getProvenanceCount(), "There should be 5 provenance documents in the Jobs database"));

migrateProvAsOperator();

assertions.push(test.assertEqual(2, hubTest.getProvenanceCount(config.STAGINGDATABASE), "There should now be 2 provenance documents in the Staging database"));
assertions.push(test.assertEqual(3, hubTest.getProvenanceCount(config.FINALDATABASE), "There should now be 3 provenance documents in the Final database"));

let stagingProvDoc = hubTestXqy.getFirstProvDocument(config.STAGINGDATABASE);
assertions.push(test.assertEqual(config.STAGINGDATABASE, fn.string(stagingProvDoc.xpath("/*:document/*:entity/database"))));
assertions.push(test.assertTrue(fn.startsWith(fn.string(stagingProvDoc.xpath("/*:document/*:entity/stepName")), "load")));
let finalProvDoc = hubTestXqy.getFirstProvDocument(config.FINALDATABASE);
assertions.push(test.assertEqual(config.FINALDATABASE, fn.string(finalProvDoc.xpath("/*:document/*:entity/database"))));
assertions.push(test.assertTrue(fn.startsWith(fn.string(finalProvDoc.xpath("/*:document/*:entity/stepName")), "map")));
assertions;

