'use strict';

var id;

let savedQuery = cts.search(cts.andQuery([cts.collectionQuery("http://marklogic.com/data-hub/saved-query"),
    cts.jsonPropertyValueQuery("owner", xdmp.getCurrentUser()),
    cts.jsonPropertyValueQuery("id", id)]));

if(fn.empty(savedQuery)) {
    savedQuery = {};
}
savedQuery;