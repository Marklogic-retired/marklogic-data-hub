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
  xdmp.documentInsert(id, envelope,
          [ xdmp.defaultPermissions(),
          xdmp.permission("harmonized-reader", "read"),
          xdmp.permission("harmonized-updater", "update")],
          options.entity);
}

module.exports = write;
