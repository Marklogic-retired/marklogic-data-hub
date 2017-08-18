'use strict';

const dhf = require('/com.marklogic.hub/dhf.xqy');

const contentPlugin = require('./content.sjs');
const headersPlugin = require('./headers.sjs');
const triplesPlugin = require('./triples.sjs');

/*
 * Plugin Entry point
 *
 * @param id          - the identifier returned by the collector
 * @param options     - a map containing options. Options are sent from Java
 *
 */
function main(id, rawContent, options) {
  let contentContext = dhf.contentContext();
  let content = dhf.run(contentContext, function() {
    return contentPlugin.createContent(id, rawContent, options);
  });

  let headerContext = dhf.headersContext(content);
  let headers = dhf.run(headerContext, function() {
    return headersPlugin.createHeaders(id, content, options);
  });

  let tripleContext = dhf.triplesContext(content, headers);
  let triples = dhf.run(tripleContext, function() {
    return triplesPlugin.createTriples(id, content, headers, options);
  });

  return dhf.makeEnvelope(content, headers, triples, options.dataFormat);
}

module.exports = {
  main: main
};
