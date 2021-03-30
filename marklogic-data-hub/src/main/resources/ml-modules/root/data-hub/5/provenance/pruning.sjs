'use strict';

const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const config = require("/com.marklogic.hub/config.sjs");


function validatePruneRequest({ retainDuration, batchSize = 100 }) {
    if (xdmp.castableAs("http://www.w3.org/2001/XMLSchema", "yearMonthDuration", retainDuration)) {
        retainDuration = xs.yearMonthDuration(retainDuration);
    } else if (xdmp.castableAs("http://www.w3.org/2001/XMLSchema", "dayTimeDuration", retainDuration)) {
        retainDuration = xs.dayTimeDuration(retainDuration);
    } else {
        httpUtils.throwBadRequest(`The duration format for the retainDuration provided ("${retainDuration}") is unsupported. Format must be in either xs:yearMonthDuration or xs:dayTimeDuration format`);
    }
    if (retainDuration.lt(xs.dayTimeDuration('PT0S'))) {
        httpUtils.throwBadRequest(`The retainDuration provided ("${retainDuration}") is unsupported. The retain duration must be a positive duration.`);
    }
    if (xdmp.castableAs("http://www.w3.org/2001/XMLSchema", "unsignedInt", batchSize)) {
        batchSize = xs.unsignedInt(batchSize);
    } else {
        httpUtils.throwBadRequest(`The value for the batchSize provided ("${batchSize}") is unsupported. batchSize must be an unsigned int.`);
    }
    return { retainDuration, batchSize };
}

function pruneProvenance(pruneRequest, endpointState) {
    xdmp.securityAssert("http://marklogic.com/data-hub/privileges/prune-provenance", "execute");
    // update with validated request properties
    Object.assign(pruneRequest, validatePruneRequest(pruneRequest));
    const { retainDuration, batchSize } = pruneRequest;
    const timePruningBegins = fn.currentDateTime().subtract(retainDuration);
    return fn.head(xdmp.invokeFunction(function() {
        const collectionQuery = cts.collectionQuery('http://marklogic.com/provenance-services/record');
        const timeQuery = cts.tripleRangeQuery(null, sem.iri('http://www.w3.org/ns/prov#generatedAtTime'), timePruningBegins, '<');
        const lastRemovedUriQuery = endpointState.lastUri ? cts.rangeQuery(cts.uriReference(), '>=', endpointState.lastUri) : null;
        const queries = [collectionQuery, timeQuery];
        if (lastRemovedUriQuery) {
            queries.push(lastRemovedUriQuery);
        }
        const finalQuery = cts.andQuery(queries);
        let estimateCount = cts.estimate(finalQuery);
        let lastUri = null;
        for (let uri of cts.uris(null, [`limit=${batchSize}`], finalQuery)) {
            xdmp.documentDelete(uri);
            lastUri = uri;
        }
        return (lastUri !== null && estimateCount > batchSize) ? {lastUri} : null;
    }, { database: xdmp.database(config.JOBDATABASE), update: 'true', commit: 'auto', ignoreAmps: false}));
}

module.exports = {
    pruneProvenance: module.amp(pruneProvenance)
};