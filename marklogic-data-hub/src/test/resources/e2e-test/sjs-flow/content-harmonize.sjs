/*
 * Create Content Plugin
 *
 * @param id         - the identifier returned by the collector
 * @param options    - an object containing options. Options are sent from Java
 *
 * @return - your content
 */
function createContent(id, options) {
  if (options.contentGoBoom === true && (id === '/input-2.json' || id === '/input-2.xml')) {
    fn.error(xs.QName("CONTENT-BOOM"), "I BLEW UP");
  }
  options.contentTest = 'content';
  var doc = cts.doc(id);
  var root = doc.root;

  // for xml we need to use xpath
  if (root && xdmp.nodeKind(root) === 'element') {
    return root.xpath('/*:envelope/*:instance/node()');
  }
  // for json we need to return the instance
  else if (root && root.envelope && root.envelope.instance) {
    return root.envelope.instance;
  }
  // for everything else
  else {
    return doc;
  }
}

module.exports = {
  createContent: createContent
};

