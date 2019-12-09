const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();
const merging = require('/com.marklogic.smart-mastering/merging.xqy');

function main(content, options) {
  let documentsAffected = [content];
  let restoredURIs = Sequence.from(merging.rollbackMerge(
    content.uri,
    options.retainAuditTrail
  ));
  if (fn.empty(restoredURIs)) {
    let msg = `Unable to rollback '${content.uri}. Are you sure it is a merged record?'`;
    datahub.debug.log({type:'error', message: msg});
    throw new Error(msg);
  }
  for (let uri of restoredURIs) {
    documentsAffected.push({uri});
  }
  return Sequence.from(documentsAffected);
}

module.exports = {
  main: main
};
