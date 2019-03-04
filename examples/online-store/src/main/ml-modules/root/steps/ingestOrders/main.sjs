const contentPlugin = require('./content/content.sjs');
const headersPlugin = require('./headers/headers.sjs');
const triplesPlugin = require('./triples/triples.sjs');
/*
 * Plugin Entry point
 *
 * @param id          - the identifier returned by the collector
 * @param rawContent  - the raw content being loaded
 * @param options     - a map containing options. Options are sent from Java
 *
 */
function main(id, rawContent, options) {
  var content = contentPlugin.createContent(id, rawContent, options);

  var headers = headersPlugin.createHeaders(id, content, options);

  var triples = triplesPlugin.createTriples(id, content, headers, options);

  var envelope = {
    envelope: {
        instance: content,
        headers,
        triples
      }
  };

  return envelope;
}

module.exports = {
  main: main
};
