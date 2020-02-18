'use strict';

var entityName;
var facetName;
var indexType;
var searchStr;
var limit;

var query;

if(indexType === 'elementRangeIndex') {
  query = cts.elementReference(facetName);
} else if(indexType === 'fieldRangeIndex') {
  query = cts.fieldReference(facetName);
} else if(indexType === 'collection') {
  query = cts.collectionReference();
} else {
  query = cts.pathReference("//*:instance/" + entityName + "/" + facetName);
}

var facetValues = cts.valueMatch(query, searchStr + "*",
    ["item-order", "ascending", "limit=" + limit]).toArray().map(String);

if (facetValues.length < limit) {
  var moreFacetValues = cts.valueMatch(query, "?*" + searchStr + "*",
      ["item-order", "ascending", "limit=" + limit]).toArray().map(String);
  facetValues = Array.from(
      [...new Set([...facetValues, ...moreFacetValues])]).slice(0, limit);
}

facetValues;