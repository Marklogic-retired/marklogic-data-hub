const lib = require('/data-hub/5/impl/hub-es.sjs');

var facetRangeSearchQuery;
if(facetRangeSearchQuery == null) {
  throw Error("Request cannot be empty");
}
let queryObj = JSON.parse(facetRangeSearchQuery);

if(queryObj.entityTypeId == null) {
  throw Error("Could not get min and max values, search query is missing entityTypeId property");
}

if(queryObj.propertyPath == null) {
  throw Error("Could not get min and max values, search query is missing propertyPath property");
}

if(queryObj.referenceType == null) {
  throw Error("Could not get min and max values, search query is missing referenceType property");
}

let entityTypeId = queryObj.entityTypeId;
let propertyPath = queryObj.propertyPath;
let referenceType = queryObj.referenceType;
var query;

let rangeValues = {
  "min": null,
  "max": null
};

if(!referenceType || referenceType === "") {
  referenceType = lib.getPropertyReferenceType(entityTypeId, propertyPath);
}

if(referenceType === 'element') {
  query = cts.elementReference(propertyPath);
} else {
  let rangeIndexPath = lib.getPropertyRangePath(entityTypeId, propertyPath);
  query = cts.pathReference(rangeIndexPath);
}

rangeValues.min = cts.min(query);
rangeValues.max = cts.max(query);

rangeValues;