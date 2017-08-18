/*~
 * Writer Plugin
 *
 * @param id       - the identifier returned by the collector
 * @param envelope - the final envelope
 * @param options  - an object options. Options are sent from Java
 *
 * @return - nothing
 */
function write(id, envelope, options) {
  xdmp.documentInsert(id, envelope, xdmp.defaultPermissions(), options.entity);
}

module.exports = write;
