/*
 * Collect IDs plugin
 *
 * @param options - a map containing options. Options are sent from Java
 *
 * @return - an array of ids or uris
 */
function collect(options) {
  if (options.collectorGoBoom === true) {
    fn.error(xs.QName("COLLECTOR-BOOM"), "I BLEW UP");
  }
  options.collectorTest = 'collector';
  return cts.uris(null, null, cts.collectionQuery(options.entity));
}

module.exports = {
  collect: collect
};
