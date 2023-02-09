const hent = require("/data-hub/5/impl/hub-entities.xqy");
const test = require("/test/test-helper.xqy");

function generateTdeWithRequiredProperties() {
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
          "required": [
            "orderId",
            "orderDateTime"
          ],
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


  let existsRequiredProperties = false;
  let cantRequiredProperties = 0;
  if (orderTemplateExists) {
    for (const column of tde.xpath('.//*:templates/*:template[*:context = ".//Order[node()]"]/*:rows/*:row/*:columns/*:column')){
      const nullableValue = fn.head(column.xpath('*:nullable'));
      if(nullableValue.toString().includes("false")){
        cantRequiredProperties ++;
        existsRequiredProperties = true;
      }
    }

    assertions.push(2,cantRequiredProperties, `only 2 required properties should exists.`);
    assertions.push(test.assertTrue(existsRequiredProperties, `required properties should exist.`));
  }
  return assertions;
}
[]
  .concat(generateTdeWithRequiredProperties());
