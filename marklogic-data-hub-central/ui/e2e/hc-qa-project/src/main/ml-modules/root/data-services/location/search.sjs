'use strict';
const egress = require("/fhir-accelerator/egress-mapping.sjs")

// search egress practitioner
var search;

// starting position for paginated search results.
var start;

// number of results per paginated search results.
var limit;

const fieldMap = new Map([
  ['address-city', 'City'],
  ['address-state', 'State'],
  ['address-postalcode', 'Zip5'],
  ['id', 'NPIAndAddressId'],
  ['_id', 'NPIAndAddressId'],
  ['name', 'AddressLine1'],
  ['address', ['AddressLine1', 'AddressLine2', "City", "State", "Zip5"]]
]);

xdmp.log("start")
xdmp.log(search)

const searchList = search ? JSON.parse(search) : [];
const options = ["case-insensitive", "wildcarded", "whitespace-insensitive", "punctuation-insensitive"];

// search for and filter your documents if needed
const query = cts.andQuery([
  cts.collectionQuery('ServiceLocation'),
  ...searchList.map(({ field, modifier, values }) => {
    const searchValues = egress.searchValuesWithModifier(values, modifier);
    return cts.jsonPropertyValueQuery(fieldMap.get(field), searchValues, options)
  })
]);

// do the search
const searchResults = cts.search(query);
// Apply paging logic
const rawDocs = fn.subsequence(searchResults, start, limit);

// Extract matching locations
/*var locations = [];
var loopCount = 1
for (var rawDoc of rawDocs) {
  for (const loc of rawDoc.xpath("//providerLocations")) {
    if (cts.contains(loc, cts.andQuery([
            ...searchList.map(({ field, modifier, values }) => {
              const searchValues = egress.searchValuesWithModifier(values, modifier)
              return cts.jsonPropertyValueQuery(fieldMap.get(field), searchValues, options)
            })])
      )) {
        if (locations.length <= limit && loopCount <= limit) {
          if (loopCount >= start) {
            locations.push(loc);            
          }
          loopCount++;
        } else {
          break;
        }
    }
  };
}*/

// standard transform on searchResults variable
const result = egress.transformMultiple(rawDocs, "ProviderToUSCoreLocation");

const results = {
  "results": result
};

// return the result
results;
