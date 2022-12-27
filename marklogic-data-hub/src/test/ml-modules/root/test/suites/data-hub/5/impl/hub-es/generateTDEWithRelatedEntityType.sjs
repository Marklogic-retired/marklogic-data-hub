const hent = require("/data-hub/5/impl/hub-entities.xqy");
const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const hubUtils = mjsProxy.requireMjsModule("/data-hub/5/impl/hub-utils.mjs");
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

    const orderTemplate = fn.head(tde.xpath('.//*:templates/*:template[*:context = "orderedBy[xs:string(.) ne """"]"]'));
    const orderTemplateExists = fn.exists(orderTemplate);
    const assertions = [
    test.assertTrue(orderTemplateExists, `Order template should exist.`)
    ];

  assertions.push(
    test.assertEqual(1, fn.count(orderTemplate.xpath("*:triples/*:triple")), "has to exists one row of triple")
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

function generateTdeReferencedByRelatedEntityType() {
  xdmp.invokeFunction(() => {
    xdmp.documentInsert("/entities/Order.entity.json", orderModel, { collections: ["http://marklogic.com/entity-services/models"]});
  }, { update: "true"});
  const input =
    [{
      "info": {
        "title": "Product",
        "version": "1.0.0",
        "baseUri": "http://example.org/"
      },
      "definitions": {
        "Product": {
          // no primary key to test scenario where entity
          "properties": {
            "productId": {
              "datatype": "integer"
            }
          }
        }
      }
    }
    ];

  const tde = fn.head(hubUtils.invokeFunction(() => hent.dumpTde(input)));
  const productIdTemplate = fn.head(tde.xpath('.//*:templates/*:template[*:context = "productId[xs:string(.) ne """"]"]'));
  const assertions = [
    test.assertTrue(fn.exists(productIdTemplate), `Product ID template should exist. Full template: ${xdmp.describe(tde, Sequence.from([]), Sequence.from([]))}`)
  ];
  assertions.push(
    test.assertEqual(3, fn.count(productIdTemplate.xpath("*:triples/*:triple")), `has to exists 3 rows of triples. ProductId template: ${xdmp.describe(productIdTemplate, Sequence.from([]), Sequence.from([]))}`)
  );
  return assertions;
}

[]
  .concat(generateTdeWithRelatedEntityType())
  .concat(generateTdeReferencedByRelatedEntityType());
