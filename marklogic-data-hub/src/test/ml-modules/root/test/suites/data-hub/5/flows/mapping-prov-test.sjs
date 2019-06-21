const test = require("/test/test-helper.xqy");
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();
const config = require("/com.marklogic.hub/config.sjs");
const Provenance = require("/data-hub/5/impl/prov.sjs");
const myProv = new Provenance();

function describe(item) {
  return xdmp.describe(item, emptySequence, emptySequence);
}

function fineProvOnMapping() {
  datahub.flow.runFlow('CustomerMapping', 'prov-test-job', [
    {
      uri: '/customer1.json',
      value: cts.doc('/customer1.json'),
      context: {}
    }
  ], { provenanceGranularityLevel: 'fine'}, 1);
  let assertions;
  // Only run assertions if run by a user with the correct permissions to read PROV docs
  let provReadRole = xdmp.getCurrentRoles().toArray().find((roleID) => {
    let roleName = xdmp.roleName(roleID);
    return roleName === 'admin' || roleName === 'ps-user';
  });
  if (provReadRole) {
    assertions = fn.head(
      xdmp.invokeFunction(function () {
        let provCount = cts.estimate(cts.collectionQuery(['http://marklogic.com/provenance-services/record']));
        let docURI = '/customer1.json';
        let resp = myProv.queryDocRecordsNoEval(docURI, {}) || [];
        let provForCustomerID = resp.filter((provInfo) => provInfo && /CustomerID$/.test(provInfo.provID));
        return [
          test.assertTrue(provCount > 1, `Provenance document count should be greater than 1 (was: ${provCount})`),
          test.assertTrue(resp.length > 1, `Provenance documents for '/customer1.json' are returned and greater than 1 (was: ${resp.length})`),
          test.assertTrue(provForCustomerID.length > 0, `Provenance info for CustomerID in '/customer1.json' exists`)
        ];
      }, {database: xdmp.database(config.JOBDATABASE)})
    );
  } else {
    assertions = [];
  }
  return assertions;
}

[]
  .concat(fineProvOnMapping());
