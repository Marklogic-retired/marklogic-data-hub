const defaultMappingLib = require("/data-hub/5/builtins/steps/mapping/default/lib.sjs");
const mappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

function describe(item) {
  return xdmp.describe(item, Sequence.from([]), Sequence.from([]));
}

// set caches to avoid DB inserts
let customerMapping = fn.head(xdmp.unquote(`{
  "lang" : "zxx",
  "name" : "CustomerXML-CustomerXMLMapping",
  "description" : "",
  "version" : 0,
  "targetEntityType" : "Customer-0.0.1/Customer",
  "sourceContext" : "/",
  "sourceURI" : "",
  "properties" : {
  "ID": {
    "sourcedFrom": "string(@CustomerID)"
  },
  "Date": {
    "sourcedFrom": "parseDateTime('DD/MM/YYYY-hh:mm:ss', date)"
  },
  "Orders": {
    "targetEntityType": "Order-0.0.1/Order",
    "sourcedFrom": "orders/order",
    "properties" : {
      "OrderID": {
        "sourcedFrom": "@id"
      }
    }
  }
}
}`));

defaultMappingLib.cachedMappingByNameAndVersion['CustomerXML-CustomerXMLMapping:0'] = customerMapping;

let customerEntity = fn.head(xdmp.unquote(`{
  "info": {
    "title": "Customer",
    "info": "0.0.1"
  },
  "definitions": {
    "Customer": {
      "required": ["ID"],
      "properties": {
        "ID": { "datatype": "string" },
        "Date": { "datatype": "dateTime" },
        "Orders": {
          "datatype": "array",
          "items": { "$ref": "#definitions/Order" }
        }
      }
    }
  }
}`));
let orderEntity = fn.head(xdmp.unquote(`{
  "info": {
    "title": "Order",
    "info": "0.0.1"
  },
  "definitions": {
    "Order": {
      "required": ["OrderID"],
      "properties": {
        "OrderID": { "datatype": "string" }
      }
    }
  }
}`));
defaultMappingLib.cachedEntityByTitleAndVersion['Customer:0.0.1'] = customerEntity;
defaultMappingLib.cachedEntityByTitleAndVersion['Order:0.0.1'] = orderEntity;

const template = fn.tail(xdmp.tidy(mappingLib.buildEntityMappingXML(customerMapping.toObject(), customerEntity.toObject()), { inputXml: 'yes'}));

/*
Per DHFPROD-2811, the "optional" is expected on the required ID element. If it's not marked as optional, and doesn't
have a value, then it will be added as ID:"". But that will not fail schema validation. Thus, by making it optional,
the "ID" property won't be included at all, which will properly fail schema validation.
 */
const expectedTemplate = fn.tail(xdmp.tidy(`
  <m:entity name="Customer" xmlns:m="http://marklogic.com/entity-services/mapping">
    <Customer xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <m:optional><ID xsi:type="xs:string"><m:val>string(@CustomerID)</m:val></ID></m:optional>
      <m:optional><Date xsi:type="xs:dateTime"><m:val>parseDateTime('DD/MM/YYYY-hh:mm:ss', date)</m:val></Date></m:optional>
      <m:for-each><m:select>orders/order</m:select>
        <Orders datatype='array'>
          <m:call-template name="Order"/>
        </Orders>
      </m:for-each>      
    </Customer>
  </m:entity>
`, { inputXml: 'yes'}));
[
  test.assertTrue(fn.deepEqual(expectedTemplate, template),
    `Entity template should build: ${describe(expectedTemplate)} got: ${describe(template)}`)
];
