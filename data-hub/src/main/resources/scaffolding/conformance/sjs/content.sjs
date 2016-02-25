/*
 * Create Content Plugin
 *
 * @param id       - the identifier returned by the collector
 * @param content  - your final content
 * @param headers  - an array of header objects
 * @param triples  - an array of triples
 * @param options  - an object containing options. Options are sent from Java
 *
 * @return - your content
 */
function createContent(id, content, headers, triples, options) {
  return fn.doc(id);
}

module.exports = {
  createContent: createContent
};
