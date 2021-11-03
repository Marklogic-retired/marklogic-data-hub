const hent = require("/data-hub/5/impl/hub-entities.xqy");
const test = require("/test/test-helper.xqy");

function generateTdeWithRelatedEntityType() {
    const input =
        [{
          "info": {
            "title": "Order",
            "version": "0.0.1",
            "baseUri": "http://marklogic.com/example/"
          },
          "definitions": {
            "Order": {
              "primaryKey": "orderId",
              "properties": {
                "orderId": {
                  "datatype": "integer"
                },
                "orderDateTime": {
                  "datatype": "dateTime"
                },
                "orderedBy": {
                  "datatype": "integer",
                  "relatedEntityType": "http://example.org/Customer-0.0.1/Customer",
                  "joinPropertyName": "customerId"
                },
                "deliveredTo": {
                  "datatype": "integer"
                },
                "lineItems": {
                  "datatype": "array",
                  "items": {
                    "$ref": "#/definitions/LineItem"
                  }
                }
              }
            },
            "LineItem": {
              "properties": {
                "quantity": {
                  "datatype": "integer"
                },
                "includes": {
                  "datatype": "integer",
                  "relatedEntityType": "http://example.org/Product-1.0.0/Product",
                  "joinPropertyName": "productId"
                }
              }
            }
          }
        }
        ];

    const tde = hent.dumpTde(input);
    const orderTemplate = fn.head(tde.xpath('.//*:templates/*:template[*:context = ".//Order[node()]"]'));
    const orderTemplateExists = fn.exists(orderTemplate);
    const assertions = [
    test.assertTrue(orderTemplateExists, `Order template should exist.`)
    ];

  assertions.push(
    test.assertEqual(3, fn.count(orderTemplate.xpath("*:triples/*:triple")), "has to exists three rows of triple")
  );

  var existsNewTriple = false;
  if (orderTemplateExists) {
    for (const columnTriple of orderTemplate.xpath("*:triples/*:triple")) {
      const predicate = fn.head(columnTriple.xpath('*:predicate/*:val'));
      if(fn.contains(predicate, "orderedBy")){
        existsNewTriple = true;
      }
    }
    assertions.push(test.assertTrue(existsNewTriple, `Triple from orderedBy should exist.`));
  }
  return assertions;
}
[]
    .concat(generateTdeWithRelatedEntityType());
