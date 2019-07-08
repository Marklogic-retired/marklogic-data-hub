'use strict'

/* A custom triples merging function
 *
 * @param mergeOptions specification of how options are to be merged
 * @param docs  the source documents that provide the values
 * @param sources  information about the source of the header data
 * @param propertySpec  configuration for how this property should be merged
 * @return zero or more sem.triples
 */
function customTrips(mergeOptions, docs, sources, propertySpec) {
  const someParam = parseInt(propertySpec.someParam, 10);
  return sem.triple(sem.iri("some-param"), sem.iri("is"), someParam);
}

exports.customTrips = customTrips;
