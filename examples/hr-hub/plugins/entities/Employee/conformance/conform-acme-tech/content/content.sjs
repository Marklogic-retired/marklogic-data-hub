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
  var root = cts.doc(id).root;

  // for xml we need to use xpath
  if (xdmp.nodeKind(root) === 'element') {
    return root.xpath('/*:envelope/*:content/node()');
  }
  // for json we need to return the content
  else {
    return root.content;
  }
}

module.exports = {
  createContent: createContent
};
