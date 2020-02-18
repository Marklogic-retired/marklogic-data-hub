'use strict';

var entityName;
var facetName;
var indexType;
var query;

let rangeValues = {
  "min": null,
  "max": null
};

if(indexType === 'elementRangeIndex') {
  query = cts.elementReference(facetName);
} else {
  query = cts.pathReference("//*:instance" + "/"+ entityName + "/" + facetName);
}

rangeValues.min = cts.min(query);
rangeValues.max = cts.max(query);

rangeValues;