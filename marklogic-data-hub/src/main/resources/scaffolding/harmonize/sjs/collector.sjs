/*
 * Collect IDs plugin
 *
 * @param options - a map containing options. Options are sent from Java
 *
 * @return - an array of ids or uris
 */
function collect(options) {
  return cts.uris(null, null, cts.trueQuery());
}

module.exports = {
  collect: collect
};
