const hubUtils = require("/data-hub/5/impl/hub-utils.sjs")
const hubTestXqy = require("/test/data-hub-test-helper.xqy")
const test = require("/test/test-helper.xqy");

const orderModel = {
  "info": {
    "title": "Order",
    "version": "0.0.1",
    "baseUri": "http://marklogic.com/example/"
  },
  "definitions": {
    "Order": {
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

const productModel = {
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
};

function testNodeExtraction() {
  xdmp.invokeFunction(() => {
    xdmp.documentInsert("/entities/Order.entity.json", orderModel, { collections: ["http://marklogic.com/entity-services/models"]});
    xdmp.documentInsert("/entities/Product.entity.json", productModel, { collections: ["http://marklogic.com/entity-services/models"]});
  }, { update: "true"});
  hubTestXqy.waitForIndexes();
  const instanceNode = new NodeBuilder().startDocument().addNode({
    "envelope": {
      "instance": {
        "info": {
          "title": "Order",
          "version": "0.0.1"
        },
        "Order": {
          "lineItems": [
            {"LineItem": { "includes": 123}}
          ]
        }
      }
    }
  }).endDocument().toNode();
  const tdeExtract = fn.head(hubUtils.invokeFunction(() => tde.nodeDataExtract([instanceNode]))).document1;
  const assertions = [
    test.assertTrue(tdeExtract.some(extract => extract instanceof sem.triple && fn.string(sem.tripleObject(extract)) === "http://example.org/Product-1.0.0/Product/123"), `Product ID should have triple generated. Full template: ${xdmp.describe(tdeExtract, Sequence.from([]), Sequence.from([]))}`),
    test.assertFalse(tdeExtract.some(extract => extract instanceof sem.triple && fn.string(sem.tripleSubject(extract)) === "http://marklogic.com/example/Order-0.0.1/Order/"), `Order subject IRI should be unique. Full template: ${xdmp.describe(tdeExtract, Sequence.from([]), Sequence.from([]))}`),
    test.assertTrue(tdeExtract.some(extract => extract instanceof sem.triple && fn.string(sem.tripleSubject(extract)).startsWith("http://marklogic.com/example/Order-0.0.1/Order/")), `Order subject IRI should have expected prefix. Full template: ${xdmp.describe(tdeExtract, Sequence.from([]), Sequence.from([]))}`)
  ];
  return assertions;
}

[]
  .concat(testNodeExtraction());
