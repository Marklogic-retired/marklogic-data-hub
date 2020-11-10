const hent = require("/data-hub/5/impl/hub-entities.xqy");
const search = require('/MarkLogic/appservices/search/search');
const test = require("/test/test-helper.xqy");

function datahubSourceNameAndTypeFacetsTest() {
  const options = hent.dumpSearchOptions(fn.doc("/entities/Customer.entity.json").toObject(), true);
  const searchResults = fn.head(search.search('', options));

  return[
    test.assertEqual("SearchEntitiesFlow", xs.string(fn.head(searchResults.xpath("/*:facet[@name = 'sourceName']/*:facet-value[1]/text()")))),
    test.assertEqual("testSourceForCustomer", xs.string(fn.head(searchResults.xpath("/*:facet[@name = 'sourceName']/*:facet-value[2]/text()")))),
    test.assertEqual("testSourceForCustomerXML", xs.string(fn.head(searchResults.xpath("/*:facet[@name = 'sourceName']/*:facet-value[3]/text()")))),
    test.assertEqual("testSourceType", xs.string(fn.head(searchResults.xpath("/*:facet[@name = 'sourceType']/*:facet-value[1]/text()")))),
    test.assertEqual("testSourceTypeXML", xs.string(fn.head(searchResults.xpath("/*:facet[@name = 'sourceType']/*:facet-value[2]/text()"))))
  ];
}

[]
    .concat(datahubSourceNameAndTypeFacetsTest());
