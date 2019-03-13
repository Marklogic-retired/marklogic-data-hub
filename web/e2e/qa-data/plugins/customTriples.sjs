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
  const triples = [];
  triples.push(
    sem.triple(
      sem.iri('http://www.marklogic.com/foo/123'),
      sem.iri('http://www.marklogic.com/foo#bar'),
      sem.iri('http://www.marklogic.com/foo/456')  
    )
  )
  return triples;
}

module.exports = {
  createTriples: createTriples
};