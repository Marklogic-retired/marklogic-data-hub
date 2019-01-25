/* global xdmp cts */

declareUpdate();

const dtu = require('/test/lib/dhfTestUtils.sjs');
const dataUriPrefix = "/test-data/employee-test/"


function removeTestData() {
    for (let uri of cts.uriMatch(dataUriPrefix+'*')) { xdmp.documentDelete(uri); };
}
dtu.mlExecuteUpdateOnStaging(removeTestData)
dtu.mlExecuteUpdateOnFinal(removeTestData)