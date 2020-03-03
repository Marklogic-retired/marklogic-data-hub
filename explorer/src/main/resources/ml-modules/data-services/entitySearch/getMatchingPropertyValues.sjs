const lib = require('/data-hub/5/impl/hub-es.sjs');

var entityTypeId;
var propertyPath;
var referenceType;
var pattern;
var limit;

var query;

if(referenceType === 'element') {
  query = cts.elementReference(propertyPath);
} else if(referenceType === 'field') {
  query = cts.fieldReference(propertyPath);
} else if(referenceType === 'collection') {
  query = cts.collectionReference();
} else {
  let rangeIndexPath = lib.getPropertyRangePath(entityTypeId, propertyPath);
  query = cts.pathReference(rangeIndexPath);
}

var facetValues = cts.valueMatch(query, pattern + "*",
    ["item-order", "ascending", "limit=" + limit]).toArray().map(String);

if (facetValues.length < limit) {
  var moreFacetValues = cts.valueMatch(query, "?*" + pattern + "*",
      ["item-order", "ascending", "limit=" + limit]).toArray().map(String);
  facetValues = Array.from(
      [...new Set([...facetValues, ...moreFacetValues])]).slice(0, limit);
}

facetValues;