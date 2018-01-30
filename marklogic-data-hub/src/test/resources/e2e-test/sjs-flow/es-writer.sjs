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
  if (options.writerGoBoom  === true && (id === '/input-2.json' || id === '/input-2.xml')) {
    fn.error(xs.QName("WRITER-BOOM"), "I BLEW UP");
  }
  xdmp.documentInsert(id, envelope, xdmp.defaultPermissions(), options.flow);
}

module.exports = write;
