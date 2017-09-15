/*
 * Create Content Plugin
 *
 * @param id         - the identifier returned by the collector
 * @param options    - an object containing options. Options are sent from Java
 *
 * @return - your content
 */
function createContent(id, options) {
  // start with an empty object
  content = {};

  // find the documents matching the given employee id
  for (var doc of cts.search(cts.jsonPropertyValueQuery('emp_id', id))) {

    // merge the keys and values from the found document into content
    for (var key in doc.root.envelope.instance) {
      if (doc.root.envelope.instance.hasOwnProperty(key)) {
        content[key] = doc.root.envelope.instance[key];
      }
    }
  }

  // return the merged content
  return content;
}

module.exports = {
  createContent: createContent
};
