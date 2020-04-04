'use strict';

let savedQueriesCollection = "http://marklogic.com/data-hub/saved-query";
let savedQueries = cts.search(cts.andQuery([cts.collectionQuery(savedQueriesCollection),
    cts.jsonPropertyValueQuery("owner", xdmp.getCurrentUser())]));

savedQueries.toObject();