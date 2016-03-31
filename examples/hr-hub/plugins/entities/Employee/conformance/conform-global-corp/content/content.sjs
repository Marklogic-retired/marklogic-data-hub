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
  // start with an empty object
  content = {};

  // find the documents matching the given employee id
  for (var doc of cts.search(cts.jsonPropertyValueQuery('emp_id', id))) {

    // merge the keys and values from the found document into content
    for (var key in doc.root.content) {
      if (doc.root.content.hasOwnProperty(key)) {
        content[key] = doc.root.content[key];
      }
    }
  }

  // return the merged content
  return content;
}

module.exports = {
  createContent: createContent
};
