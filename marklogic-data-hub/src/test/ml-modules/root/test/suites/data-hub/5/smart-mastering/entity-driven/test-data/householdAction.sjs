'use strict';

const sem = require("/MarkLogic/semantics.xqy");
const householdPredicateIRI = sem.iri('http://marklogic.com/datahub/test/household#memberOf');

function householdAction(uri, matches, options) {
    const allURIs = [uri].concat(matches.map((match) => match.uri)).sort();
    const householdIRI = sem.iri(`http://marklogic.com/datahub/test/household/${xdmp.md5(allURIs)}`);
    return {
            uri: fn.string(householdIRI),
            value: {
                triples: allURIs.map((uri) => sem.triple(sem.iri(uri), householdPredicateIRI, householdIRI))
            },
            context: {
                collections: ['households', 'http://marklogic.com/semantics#default-graph'],
                permissions: [xdmp.permission('data-hub-common', 'read'),xdmp.permission('data-hub-common', 'update')]
            }
        };
}

module.exports = {
    householdAction
};