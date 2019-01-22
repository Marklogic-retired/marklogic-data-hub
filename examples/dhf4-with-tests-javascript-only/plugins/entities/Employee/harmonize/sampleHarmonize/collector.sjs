/*
 * Collect IDs plugin
 *
 * @param options - a map containing options. Options are sent from Java
 *
 * @return - an array of ids or uris
 */
function collect(options) {
  let andQueries = [cts.collectionQuery(options.entity)]
  if (options["dhf.collection"]) {
    andQueries.push(cts.collectionQuery(options["dhf.collection"]))
  }
  return cts.uris(null, null, cts.andQuery(andQueries));
}

module.exports = {
  collect: collect
};
