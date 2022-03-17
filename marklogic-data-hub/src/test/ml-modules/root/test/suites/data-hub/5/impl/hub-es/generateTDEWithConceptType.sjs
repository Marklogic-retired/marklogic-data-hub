const hent = require("/data-hub/5/impl/hub-entities.xqy");
const test = require("/test/test-helper.xqy");

function generateTdeWithRelatedEntityType() {
    const input =
        [{
          "info": {
            "title": "Product",
            "version": "1.0.0",
            "baseUri": "http://example.org/"
          },
          "definitions": {
            "Product": {
              "primaryKey": "productId",
              "properties": {
                "productId": {
                  "datatype": "integer"
                },
                "productName": {
                  "datatype": "string",
                  "collation": "http://marklogic.com/collation/codepoint"
                },
                "category": {
                  "datatype": "string",
                  "collation": "http://marklogic.com/collation/codepoint"
                }
              },
              "relatedConcepts": [
                {
                  "context": "category",
                  "predicate": "isCategory",
                  "conceptExpression": "sem:iri(\"http://www.example.com/Category/\" || fn:replace(fn:string(.),'\\s+', ''))"
                }
              ]
            }
          }
        }
        ];

    const tde = hent.dumpTde(input);
    const contextTemplate = fn.head(tde.xpath('.//*:templates/*:template[*:context = ".//Product[node()]"]/*:templates/*:template[*:context = "category"]'));
    const contextTemplateExists = fn.exists(contextTemplate);
    const assertions = [
    test.assertTrue(contextTemplateExists, `Context template should exist.`)
    ];

  assertions.push(
    test.assertEqual(1, fn.count(contextTemplate.xpath("*:triples/*:triple")), "has to exists three rows of triple")
  );

  var existsConceptTriple = false;
  if (contextTemplateExists) {
    for (const columnTriple of contextTemplate.xpath("*:triples/*:triple")) {
      const predicate = fn.head(columnTriple.xpath('*:predicate/*:val'));
      if(fn.contains(predicate, "isCategory")){
        existsConceptTriple = true;
      }
    }
    assertions.push(test.assertTrue(existsConceptTriple, `Triple from concept should exist.`));
  }
  return assertions;
}
[]
    .concat(generateTdeWithRelatedEntityType());
