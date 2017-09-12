/*
 * Create Content Plugin
 *
 * @param id         - the identifier returned by the collector
 * @param rawContent - the raw content being loaded.
 * @param options    - an object containing options. Options are sent from Java
 *
 * @return - your content
 */
function createContent(id, rawContent, options) {
  if (options.contentGoBoom === true && (id === '/input-2.json' || id === '/input-2.xml')) {
    fn.error(xs.QName("CONTENT-BOOM"), "I BLEW UP");
  }
  return rawContent;
}

=-00=--\8\sthifalkj;;

module.exports = {
  createContent: createContent
};
