// dhf.sjs exposes helper functions to make your life easier
// See documentation at:
// https://github.com/marklogic/marklogic-data-hub/wiki/dhf-lib
const dhf = require('/data-hub/4/dhf.sjs');

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

  var envelope = dhf.makeEnvelope(content, headers, triples, options.dataFormat);

  // log the final envelope as a trace
  // only fires if tracing is enabled
  dhf.logTrace(dhf.writerContext(envelope));

  return envelope;
}

module.exports = {
  main: main
};
