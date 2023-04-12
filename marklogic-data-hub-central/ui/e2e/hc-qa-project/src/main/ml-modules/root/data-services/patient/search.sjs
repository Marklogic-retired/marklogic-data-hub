'use strict';
const egress = require("/fhir-accelerator/egress-mapping.sjs")

// search egress practitioner
var search;

// starting position for paginated search results.
// currently not implemented.
var start;

// number of results per paginated search results.
// currently not implemented.
var limit;

const prefixedSearchTerms = new Map([
  ['_lastUpdated', 'dateTime'],
  ['birthdate', 'date'],
  ['death-date', 'date']
]);

const identifierSearchTerms = new Map([
  ['identifier', 'identifiers']
]);

const fieldMap = new Map([
  ['given', 'FirstName'],
  ['family', 'LastName'],
  ['name', ['FirstName', 'LastName', 'FullName']],
  ['birthdate', 'DOB'],
  ['gender', 'Gender'],
  ['address-city', 'city'],
  ['address-state', 'state'],
  ['address-postalcode', 'Zip5'],
  ['id', 'MasterPersonIndex'],
  ['_id', 'MasterPersonIndex'],
  ['_lastUpdated', "createdOn"]
]);

const codingSystemMap = new Map([
  ['http://hl7.org/fhir/sid/us-ssn', 'SSN']
]);
const typeSystemMap = new Map([
  ['http://terminology.hl7.org/CodeSystem/v2-0203|SS', 'SSN'],
  ['http://terminology.hl7.org/CodeSystem/v2-0203|MA', 'MEDICAID_ID']
]);

const searchList = search ? JSON.parse(search) : [];

// search for and filter your documents if needed
const query = cts.andQuery([
  cts.collectionQuery('sm-Member-mastered'),
  // cts.jsonPropertyValueQuery("providerType", "PERSON"),
  ...searchList.map(({ field, modifier, values }) => {
    const searchValues = egress.searchValuesWithModifier(values, modifier)

    if (prefixedSearchTerms.has(field)) {
      const xsConverterFn = prefixedSearchTerms.get(field);
      return cts.jsonPropertyRangeQuery(fieldMap.get(field), egress.modifierPrefixMap.get(modifier), xs[xsConverterFn](values[0]))
    } else if (identifierSearchTerms.has(field)) {
      const identifiers = values.map(valueString => {
        const index = valueString.lastIndexOf('|');
        const system = valueString.slice(0, index);
        const value = valueString.slice(index + 1);
        const searchProperties = [];
        if (value !== '') {
          searchProperties.push(cts.jsonPropertyScopeQuery('value', value));
        }
        if (index > 0) {
          const systemType = modifier === 'of-type' ? typeSystemMap.get(system) : codingSystemMap.get(system);
          if (systemType !== undefined) {
            searchProperties.push(cts.jsonPropertyScopeQuery('type', systemType));
          }
        }
        return searchProperties;
      })

      return cts.jsonPropertyScopeQuery(identifierSearchTerms.get(field), cts.andQuery(identifiers));
    } else {
      return cts.jsonPropertyValueQuery(fieldMap.get(field), searchValues,
        ["case-insensitive", "wildcarded", "whitespace-insensitive", "punctuation-insensitive"])
    }
  })
]);

xdmp.log(xdmp.quote(query), "debug");
// do the search
const searchResults = cts.search(query);
// Apply paging logic
const rawDocs = fn.subsequence(searchResults, start, limit)
// standard transform on searchResults variable
const result = egress.transformMultiple(rawDocs, "MemberToUSCorePatient");

const results = {
  "results": result
};

// return the result
results;
