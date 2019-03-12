const contentPlugin = require('./content/content.sjs');
const headersPlugin = require('./headers/headers.sjs');
const triplesPlugin = require('./triples/triples.sjs');
/*
 * Plugin Entry point
 *
 * @param contentDesc  - the raw content being loaded
 * @param options     - a map containing options. Options are sent from Java
 *
 */
function main(contentDesc, options) {
  let content = contentPlugin.createContent(contentDesc.uri, contentDesc.value, options);

  let headers = headersPlugin.createHeaders(contentDesc.uri, content, options);

  let triples = triplesPlugin.createTriples(contentDesc.uri, content, headers, options);

  contentDesc.value = {
      envelope: {
          instance: content,
          headers,
          triples
        }
    };

  return contentDesc;
}

module.exports = {
  main: main
};
