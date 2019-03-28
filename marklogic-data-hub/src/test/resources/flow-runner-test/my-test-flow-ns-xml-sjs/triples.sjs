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
  return [
    sem.triple(sem.iri('subject'), sem.iri('predicate'), sem.iri('object'))
  ];
}

module.exports = {
  createTriples: createTriples
};

