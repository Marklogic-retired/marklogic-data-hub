const hent = require("/data-hub/5/impl/hub-entities.xqy");
const test = require("/test/test-helper.xqy");

const orderModel = {
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
};

function generateTdeWithRelatedEntityType() {
    const input = [ orderModel ];
    const tde = hent.dumpTde(input);

    const orderTemplate = fn.head(tde.xpath('.//*:templates/*:template[*:context = "includes[xs:string(.) ne """"]"]'));
    const orderTemplateExists = fn.exists(orderTemplate);
    const assertions = [
    test.assertTrue(orderTemplateExists, `Order template should exist.`)
    ];

  assertions.push(
    test.assertEqual(1, fn.count(orderTemplate.xpath("*:triples/*:triple")), "has to exists one row of triple")
  );

  let existsTriple = false;
  if (orderTemplateExists) {
    for (const columnTriple of orderTemplate.xpath("*:triples/*:triple")) {
      const predicate = fn.head(columnTriple.xpath('*:predicate/*:val'));
      if(fn.contains(predicate, "LineItem/includes")){
        existsTriple = true;
      }
    }
    assertions.push(test.assertTrue(existsTriple, `Triple from LineItem/includes should exists.`));
  }
  return assertions;
}



[]
  .concat(generateTdeWithRelatedEntityType());
