
import DataHubSingleton from "/data-hub/5/datahub-singleton.mjs";

const datahub = DataHubSingleton.instance();
const merging = require('/com.marklogic.smart-mastering/merging.xqy');

function main(content, options) {
  let documentsAffected = [content];
  let restoredURIs = xdmp.invokeFunction(() => merging.rollbackMerge(
    content.uri,
    options.retainAuditTrail,
    options.blockFutureMerges,
    Sequence.from(options.removeURIs)
  ), {update: "true"});
  if (fn.empty(restoredURIs)) {
    let msg = `Unable to rollback '${content.uri}. Are you sure it is a merged record?'`;
    datahub.debug.log({type: 'error', message: msg});
    throw new Error(msg);
  }
  for (let uri of restoredURIs) {
    documentsAffected.push({uri});
  }
  return Sequence.from(documentsAffected);
}

export default {
  main
};
