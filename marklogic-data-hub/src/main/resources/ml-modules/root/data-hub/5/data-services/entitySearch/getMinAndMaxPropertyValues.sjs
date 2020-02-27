const lib = require('/data-hub/5/impl/hub-es.sjs');

var entityIRI;
var propertyPath;
var referenceType;

var query;

let rangeValues = {
  "min": null,
  "max": null
};

if(!referenceType || referenceType === "") {
  referenceType = lib.getPropertyReferenceType(entityIRI, propertyPath);
}

if(referenceType === 'element') {
  query = cts.elementReference(propertyPath);
} else {
  let rangeIndexPath = lib.getPropertyRangePath(entityIRI, propertyPath);
  query = cts.pathReference(rangeIndexPath);
}

rangeValues.min = cts.min(query);
rangeValues.max = cts.max(query);

rangeValues;