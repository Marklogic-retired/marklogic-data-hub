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
function main(id, options) {
  let contentContext = dhf.contentContext();
  let content = dhf.run(contentContext, function() {
    return contentPlugin.createContent(id, options);
  });

  let headerContext = dhf.headersContext(content);
  let headers = dhf.run(headerContext, function() {
    return headersPlugin.createHeaders(id, content, options);
  });

  let tripleContext = dhf.triplesContext(content, headers);
  let triples = dhf.run(tripleContext, function() {
    return triplesPlugin.createTriples(id, content, headers, options);
  });

  if (options.mainGoBoom  === true && (id === '/input-2.json' || id === '/input-2.xml')) {
    fn.error(xs.QName("MAIN-BOOM"), "I BLEW UP");
  }

  if (options.extraPlugin === true) {
    const extraPlugin = require('./extra-plugin.sjs');
    let extraContext = dhf.context('extraPlugin');
    dhf.run(extraContext, function() {
      return extraPlugin.doSomethingExtra(id, options);
    });
  }

  let envelope = dhf.makeEnvelope(content, headers, triples, options.dataFormat);

  // explain. needed to call this way for static analysis
  dhf.runWriter(xdmp.function(null, './writer.sjs'), id, envelope, options);
}

module.exports = {
  main: main
};
