const lib = require('/data-hub/5/impl/hub-es.sjs');

var facetValuesSearchQuery;
if(facetValuesSearchQuery == null) {
  throw Error("Request cannot be empty");
}
let queryObj = JSON.parse(facetValuesSearchQuery);

if(queryObj.entityTypeId == null) {
  throw Error("Could not get matching values, search query is missing entityTypeId property");
}

if(queryObj.propertyPath == null) {
  throw Error("Could not get matching values, search query is missing propertyPath property");
}

if(queryObj.referenceType == null) {
  throw Error("Could not get matching values, search query is missing referenceType property");
}

if(queryObj.limit == null) {
  queryObj.limit = 10;
}

if(queryObj.pattern == null) {
  queryObj.pattern = "";
}

let entityTypeId = queryObj.entityTypeId;
let propertyPath = queryObj.propertyPath;
let referenceType = queryObj.referenceType;
let limit = queryObj.limit;
let pattern = queryObj.pattern;
var query;

if (referenceType === "field") {
  if (propertyPath === "createdByStep") {
    propertyPath = "datahubCreatedByStep";
  }

  if (propertyPath === "createdInFlowRange") {
    propertyPath = "datahubCreatedInFlow";
  }
}

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