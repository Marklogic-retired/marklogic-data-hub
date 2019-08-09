const merging = require('/com.marklogic.smart-mastering/merging.xqy');

function main(content, options) {
  let documentsAffected = [content];
  let restoredURIs = Sequence.from(merging.rollbackMerge(
    content.uri,
    options.retainAuditTrail
  ));
  for (let uri of restoredURIs) {
    documentsAffected.push({uri});
  }
  return Sequence.from(documentsAffected);
}

module.exports = {
  main: main
};
