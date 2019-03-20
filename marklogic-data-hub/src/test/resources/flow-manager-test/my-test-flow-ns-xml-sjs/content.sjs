/*
 * Create Content Plugin
 *
 * @param id         - the identifier returned by the collector
 * @param options    - an object containing options. Options are sent from Java
 *
 * @return - your content
 */
function createContent(id, options) {
  let source = fn.head(cts.doc(id));
  let Id = xs.long(fn.head(fn.head(cts.doc(id)).xpath('/*:employee/*:id')));

  return {
    "$type": "Person",
    "$version": "0.0.1",
    "$namespace": "http://marklogic.com/Person",
    "$namespacePrefix": "prs",
    "Id": Id
  }
}

module.exports = {
  createContent: createContent
};

