const hent = require("/data-hub/5/impl/hub-entities.xqy");
const search = require('/MarkLogic/appservices/search/search');
const test = require("/test/test-helper.xqy");

function datahubSourceNameAndTypeFacetsTest() {
  const options = hent.dumpSearchOptions(fn.doc("/entities/Customer.entity.json").toObject(), true);
  const searchResults = fn.head(search.search('', options));

  return [
    test.assertEqual("testSourceForCustomer", xs.string(fn.head(searchResults.xpath("/*:facet[@name = 'sourceName']/*:facet-value[1]/text()")))),
    test.assertEqual("testSourceForCustomerXML", xs.string(fn.head(searchResults.xpath("/*:facet[@name = 'sourceName']/*:facet-value[2]/text()")))),
    test.assertEqual("testSourceType", xs.string(fn.head(searchResults.xpath("/*:facet[@name = 'sourceType']/*:facet-value[1]/text()")))),
    test.assertEqual("testSourceTypeXML", xs.string(fn.head(searchResults.xpath("/*:facet[@name = 'sourceType']/*:facet-value[2]/text()"))))
  ];
}

function selectedPropertiesTransformTest() {
  const searchResultsTransform = require('/marklogic.rest.transform/hubEntitySearchTransform/assets/transform.sjs');
  const transformedResults = searchResultsTransform.transform({}, { entityName: 'Customer'}, xdmp.toJSON({ results: []}));

  return[
    test.assertTrue(transformedResults.selectedPropertyDefinitions && transformedResults.selectedPropertyDefinitions.length >= 1, `There should be at least one selected property. Results: ${xdmp.toJsonString(transformedResults)}`),
    test.assertEqual("customerId", transformedResults.selectedPropertyDefinitions[0].propertyLabel, `The first selected property should be the primary key. selectedPropertiesDefinition[0]: ${xdmp.toJsonString(transformedResults.selectedPropertyDefinitions[0])}`)
  ];
}

[]
    .concat(datahubSourceNameAndTypeFacetsTest())
    .concat(selectedPropertiesTransformTest());
