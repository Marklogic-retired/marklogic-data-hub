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
                  "conceptClass": "testConceptClass",
                  "context": "category",
                  "predicate": "isCategory",
                  "conceptExpression": "sem:iri(\"http://www.example.com/Category/\" || fn:replace(fn:string(.),'\\s+', ''))"
                },
                {
                  "conceptClass": "testConceptClass",
                  "context": ".",
                  "predicate": "hasConcept",
                  "conceptExpression": ""
                }
              ]
            }
          }
        }
        ];

    const tde = hent.dumpTde(input);
  const contextTemplate = fn.head(tde.xpath('.//*:templates/*:template[*:context = "category[  xs:string(.) ne """"]"]'));
  const contextTemplateWithDot = fn.head(tde.xpath(`.//*:templates/*:template[*:context = ".//Product[node()]"]/*:templates/*:template[*:context = '.']`));
  const contextTemplateExists = fn.exists(contextTemplate);
  const contextTemplatewithDotExists = fn.exists(contextTemplateWithDot);
    const assertions = [
    test.assertTrue(contextTemplateExists, `Context template should exist.`),
    test.assertTrue(contextTemplatewithDotExists, `Context template with dot should exist. ${xdmp.describe(tde, Sequence.from([]), Sequence.from([]))}`)
    ];

  assertions.push(
    test.assertEqual(3, fn.count(contextTemplate.xpath("*:triples/*:triple")), "has to exists two triples")
  );

  let existsConceptTriple = false;
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
