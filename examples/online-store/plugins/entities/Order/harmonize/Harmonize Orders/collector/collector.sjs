/*
 * Collect IDs plugin
 *
 * @param options - a map containing options. Options are sent from Java
 *
 * @return - an array of ids or uris
 */
function collect(options) {
	const jsearch = require('/MarkLogic/jsearch.sjs');
  return jsearch
    .values('id')
    .where(cts.collectionQuery(options.entity))
    .slice(0, Number.MAX_SAFE_INTEGER)
    .result();
}

module.exports = {
  collect: collect
};
