'use strict';
const egress = require("/fhir-accelerator/egress-mapping.sjs")

// search egress practitioner
var search;

// starting position for paginated search results.
var start;

// number of results per paginated search results.
var limit;

const fieldMap = new Map([
  ['practitioner', 'NPI']
]);

const searchList = search ? JSON.parse(search) : [];

/*
search JSON format
{
  field: "practitioner",
  values: ["practitionerid-1", "practitionerid-2"]
}
*/

// search for and filter your documents if needed
const query = cts.andQuery([
  cts.collectionQuery('Provider'),
  cts.jsonPropertyWordQuery("ProviderName", "Dr.", ["case-insensitive", "punctuation-sensitive"]),
  ...searchList.map(({ field, modifier, values }) => {
    if(field === "practitioner") {
      const searchValues = egress.searchValuesWithModifier(values, "exact");
      return cts.jsonPropertyValueQuery(fieldMap.get(field), searchValues)
    }
  })
]);

// do the search
const searchResults = cts.search(query);

// Apply paging logic
const rawDocs = fn.subsequence(searchResults, start, limit);

// standard transform on searchResults variable
const result = egress.transformMultiple(rawDocs, "ProviderToUSCorePractitionerRole");

const results = {
  "results": result
};

// return the result
results;
