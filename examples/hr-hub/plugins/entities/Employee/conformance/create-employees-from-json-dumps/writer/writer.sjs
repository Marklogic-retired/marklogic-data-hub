/*~
 * Writer Plugin
 *
 * @param id       - the identifier returned by the collector
 * @param envelope - the final envelope
 * @param options  - a map containing options. Options are sent from Java
 *
 * @return - zero or more header nodes
 */
function write(id, content, options) {
  xdmp.documentInsert(id, content, [], ['json-employee']);
}

module.exports = {
  write: write
};

