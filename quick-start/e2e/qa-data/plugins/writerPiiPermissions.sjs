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
  let perms = [xdmp.permission("data-hub-admin-role", "read"), xdmp.permission("flow-operator-role", "read")];
  xdmp.documentInsert(id, envelope, perms, options.entity);
}

module.exports = write;

