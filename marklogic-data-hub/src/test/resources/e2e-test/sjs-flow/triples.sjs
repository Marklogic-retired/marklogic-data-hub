/*
 * Create Triples Plugin
 *
 * @param id       - the identifier returned by the collector
 * @param content  - the output of your content plugin
 * @param headers  - the output of your heaaders plugin
 * @param options  - an object containing options. Options are sent from Java
 *
 * @return - an array of triples
 */
function createTriples(id, content, headers, options) {
  if (options.triplesGoBoom  === true && (id === '/input-2.json' || id === '/input-2.xml')) {
    fn.error(xs.QName("TRIPLES-BOOM"), "I BLEW UP");
  }
  options.triplesTest = 'triples';
  return [
    sem.triple("a", "b", "c"),
    sem.triple("x", "y", "z"),
  ];
}

module.exports = {
  createTriples: createTriples
};

