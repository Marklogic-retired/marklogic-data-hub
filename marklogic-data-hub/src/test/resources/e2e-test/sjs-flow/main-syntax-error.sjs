const dhf = require('/data-hub/4/dhf.sjs');

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

  =-00=--\8\sthifalkj;;

  var envelope = dhf.makeEnvelope(content, headers, triples, options.dataFormat);

  // log the final envelope as a trace
  // only fires if tracing is enabled
  dhf.logTrace(dhf.writerContext(envelope));

  return envelope;
}

module.exports = {
  main: main
};
