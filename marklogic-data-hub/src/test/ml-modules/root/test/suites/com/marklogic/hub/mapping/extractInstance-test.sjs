const test = require("/test/test-helper.xqy");
const mappingLib = require("/data-hub/5/builtins/steps/mapping/default/lib.sjs");
const emptySequence = Sequence.from([]);

function describe(item) {
  return xdmp.describe(item, emptySequence, emptySequence);
}

// Here the sourceContext in the mapping is '/'
function extractInstanceDefaultSrcCntxtJson() {
  const modelName = "Order";
  const model = {
    "definitions": {
      "Order": {
        "description": "The Order entity root.",
        "required": [],
        "rangeIndex": [],
        "elementRangeIndex": [],
        "wordLexicon": [],
        "pii": [],
        "properties": {
          "OrderID": {"datatype": "string"},
          "CustomerID": {"datatype": "string"},
          "OrderDate": {"datatype": "string"}
        }
      }
    },
    "info": {"title": "Order", "version": "0.0.1", "baseUri": "http://marklogic.com/", "description": "An Order entity"}
  };
  const mapping = {
    "lang": "zxx",
    "name": "OrderMappingJson",
    "description": "Default description",
    "version": 1,
    "targetEntityType": "http://marklogic.com/Order-0.0.1/Order",
    "sourceContext": "/",
    "sourceURI": "",
    "properties": {"OrderID": {"sourcedFrom": "OrderID"}, "CustomerID": {"sourcedFrom": "CustomerID"}}
  };
  const content = {
    "envelope": {
      "headers": {},
      "triples": [],
      "instance": {
        "OrderID": "10248",
        "CustomerID": "VINET",
        "OrderDate": "1996-07-04T14:25:55",
        "OrderDetails": [{
          "ProductID": "11",
          "UnitPrice": "14.0000",
          "Quantity": "12",
          "Discount": "0"
        }]
      },
      "attachments": null
    }
  };

  const extractInstance = mappingLib.extractInstanceFromModel(model, modelName, mapping, content);

  return [
    test.assertEqual("10248", extractInstance.OrderID, `Unexpected output: ${describe(extractInstance)}`),
    test.assertEqual("VINET", extractInstance.CustomerID, `Unexpected output: ${describe(extractInstance)}`),
    test.assertEqual("1996-07-04T14:25:55", extractInstance.OrderDate, `Unexpected output: ${describe(extractInstance)}`)
  ];
}

function extractInstanceCustomSrcCntxtJson() {
  const modelName = "Order";
  const model = {
    "definitions": {
      "Order": {
        "description": "The Order entity root.",
        "required": [],
        "rangeIndex": [],
        "elementRangeIndex": [],
        "wordLexicon": [],
        "pii": [],
        "properties": {
          "OrderID": {"datatype": "string"},
          "CustomerID": {"datatype": "string"},
          "OrderDate": {"datatype": "string"}
        }
      }
    },
    "info": {"title": "Order", "version": "0.0.1", "baseUri": "http://marklogic.com/", "description": "An Order entity"}
  };
  const mapping = {
    "lang": "zxx",
    "name": "OrderMappingJson",
    "description": "Default description",
    "version": 1,
    "targetEntityType": "http://marklogic.com/Order-0.0.1/Order",
    "sourceContext": "/",
    "sourceURI": "",
    "properties": {"OrderID": {"sourcedFrom": "OrderID"}, "CustomerID": {"sourcedFrom": "CustomerID"}}
  };
  const content = {
    "envelope": {
      "headers": {},
      "triples": [],
      "instance": {
        "OrderID": "10248",
        "CustomerID": "VINET",
        "OrderDate": "1996-07-04T14:25:55",
        "OrderDetails": [{
          "ProductID": "11",
          "UnitPrice": "14.0000",
          "Quantity": "12",
          "Discount": "0"
        }]
      },
      "attachments": null
    }
  };

  const extractInstance = mappingLib.extractInstanceFromModel(model, modelName, mapping, content);
  return [
    test.assertEqual("10248", extractInstance.OrderID, `Unexpected output: ${describe(extractInstance)}`),
    test.assertEqual("VINET", extractInstance.CustomerID, `Unexpected output: ${describe(extractInstance)}`),
    test.assertEqual("1996-07-04T14:25:55", extractInstance.OrderDate, `Unexpected output: ${describe(extractInstance)}`)
  ];
}

function extractInstanceDefaultSrcCntxtXml() {
  const modelName = "Order";
  const model = {
    "definitions": {
      "Order": {
        "description": "The Order entity root.",
        "required": [],
        "rangeIndex": [],
        "elementRangeIndex": [],
        "wordLexicon": [],
        "pii": [],
        "properties": {
          "OrderID": {"datatype": "string"},
          "CustomerID": {"datatype": "string"},
          "OrderDate": {"datatype": "string"}
        }
      }
    },
    "info": {"title": "Order", "version": "0.0.1", "baseUri": "http://marklogic.com/", "description": "An Order entity"}
  };
  const mapping = {
    "lang": "zxx",
    "name": "OrderMappingJson",
    "description": "Default description",
    "version": 1,
    "targetEntityType": "http://marklogic.com/Order-0.0.1/Order",
    "sourceContext": "/",
    "sourceURI": "",
    "properties": {"OrderID": {"sourcedFrom": "OrderID"}, "CustomerID": {"sourcedFrom": "CustomerID"}}
  };
  const content = xdmp.unquote(`<?xml version="1.0" encoding="UTF-8"?>
  <envelope xmlns="http://marklogic.com/entity-services">
  <headers/>
  <triples/>
  <instance>
      <Order xmlns="">
          <OrderID>10248</OrderID>
          <CustomerID>VINET</CustomerID>
          <OrderDate>1996-07-04T14:25:55</OrderDate>
          <OrderDetails>
              <OrderDetail>
                  <ProductID>11</ProductID>
                  <UnitPrice>14.0000</UnitPrice>
                  <Quantity>12</Quantity>
                  <Discount>0</Discount>
              </OrderDetail>
          </OrderDetails>
      </Order>
  </instance>
  <attachments/>
  </envelope>`);

  const extractInstance = mappingLib.extractInstanceFromModel(model, modelName, mapping, content);

  return [
    test.assertEqual("10248", extractInstance.OrderID, `Unexpected output: ${describe(extractInstance)}`),
    test.assertEqual("VINET", extractInstance.CustomerID, `Unexpected output: ${describe(extractInstance)}`),
    test.assertEqual("1996-07-04T14:25:55", extractInstance.OrderDate, `Unexpected output: ${describe(extractInstance)}`)
  ];
}

// Here the sourceContext in mapping is '/Order'
function extractInstanceCustomSrcCntxtXml() {
  const modelName = "Order";
  const model = {
    "definitions": {
      "Order": {
        "description": "The Order entity root.",
        "required": [],
        "rangeIndex": [],
        "elementRangeIndex": [],
        "wordLexicon": [],
        "pii": [],
        "properties": {
          "OrderID": {"datatype": "string"},
          "CustomerID": {"datatype": "string"},
          "OrderDate": {"datatype": "string"}
        }
      }
    },
    "info": {"title": "Order", "version": "0.0.1", "baseUri": "http://marklogic.com/", "description": "An Order entity"}
  };
  const mapping = {
    "lang": "zxx",
    "name": "OrderMappingJson",
    "description": "Default description",
    "version": 1,
    "targetEntityType": "http://marklogic.com/Order-0.0.1/Order",
    "sourceContext": "/",
    "sourceURI": "",
    "properties": {"OrderID": {"sourcedFrom": "OrderID"}, "CustomerID": {"sourcedFrom": "CustomerID"}}
  };
  const content = xdmp.unquote(`<?xml version="1.0" encoding="UTF-8"?>
  <envelope xmlns="http://marklogic.com/entity-services">
  <headers/>
  <triples/>
  <instance>
      <Order xmlns="">
          <OrderID>10248</OrderID>
          <CustomerID>VINET</CustomerID>
          <OrderDate>1996-07-04T14:25:55</OrderDate>
          <OrderDetails>
              <OrderDetail>
                  <ProductID>11</ProductID>
                  <UnitPrice>14.0000</UnitPrice>
                  <Quantity>12</Quantity>
                  <Discount>0</Discount>
              </OrderDetail>
          </OrderDetails>
      </Order>
  </instance>
  <attachments/>
  </envelope>`);

  const extractInstance = mappingLib.extractInstanceFromModel(model, modelName, mapping, content);

  return [
    test.assertEqual("10248", extractInstance.OrderID, `Unexpected output: ${describe(extractInstance)}`),
    test.assertEqual("VINET", extractInstance.CustomerID, `Unexpected output: ${describe(extractInstance)}`),
    test.assertEqual("1996-07-04T14:25:55", extractInstance.OrderDate, `Unexpected output: ${describe(extractInstance)}`)
  ];
}

[]
  .concat(extractInstanceDefaultSrcCntxtJson())
  .concat(extractInstanceCustomSrcCntxtJson())
  .concat(extractInstanceDefaultSrcCntxtXml())
  .concat(extractInstanceCustomSrcCntxtXml());
