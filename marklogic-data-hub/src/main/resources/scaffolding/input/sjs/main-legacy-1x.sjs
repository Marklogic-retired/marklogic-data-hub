const dhf = require('/data-hub/4/dhf.sjs');

const contentPlugin = require('./content/content.sjs');
const headersPlugin = require('./headers/headers.sjs');
const triplesPlugin = require('./triples/triples.sjs');

/*
 * Plugin Entry point
 *
 * @param id          - the identifier returned by the collector
 * @param options     - a map containing options. Options are sent from Java
 *
 */
function main(id, rawContent, options) {
  var contentContext = dhf.contentContext(rawContent);
  var content = dhf.run(contentContext, function() {
    return contentPlugin.createContent(id, rawContent, options);
  });

  var headerContext = dhf.headersContext(content);
  var headers = dhf.run(headerContext, function() {
    return headersPlugin.createHeaders(id, content, options);
  });

  var tripleContext = dhf.triplesContext(content, headers);
  var triples = dhf.run(tripleContext, function() {
    return triplesPlugin.createTriples(id, content, headers, options);
  });

  return dhf.makeLegacyEnvelope(content, headers, triples, options.dataFormat);
}

module.exports = {
  main: main
};
