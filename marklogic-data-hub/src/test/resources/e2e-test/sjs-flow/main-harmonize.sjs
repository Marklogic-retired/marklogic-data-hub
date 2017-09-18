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
  var contentContext = dhf.contentContext();
  var content = dhf.run(contentContext, function() {
    return contentPlugin.createContent(id, options);
  });

  var headerContext = dhf.headersContext(content);
  var headers = dhf.run(headerContext, function() {
    return headersPlugin.createHeaders(id, content, options);
  });

  var tripleContext = dhf.triplesContext(content, headers);
  var triples = dhf.run(tripleContext, function() {
    return triplesPlugin.createTriples(id, content, headers, options);
  });

  if (options.mainGoBoom  === true && (id === '/input-2.json' || id === '/input-2.xml')) {
    fn.error(xs.QName("MAIN-BOOM"), "I BLEW UP");
  }

  if (options.extraPlugin === true) {
    const extraPlugin = require('./extra-plugin.sjs');
    var extraContext = dhf.context('extraPlugin');
    dhf.run(extraContext, function() {
      return extraPlugin.doSomethingExtra(id, options);
    });
  }

  var envelope = dhf.makeEnvelope(content, headers, triples, options.dataFormat);

  // writers must be invoked this way.
  // see: https://github.com/marklogic-community/marklogic-data-hub/wiki/dhf-lib#run-writer
  dhf.runWriter(xdmp.function(null, './writer.sjs'), id, envelope, options);
}

module.exports = {
  main: main
};
