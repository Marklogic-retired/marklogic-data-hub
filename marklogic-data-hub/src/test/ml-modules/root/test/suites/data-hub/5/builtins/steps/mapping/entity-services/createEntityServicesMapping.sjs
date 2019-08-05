const defaultMappingLib = require("/data-hub/5/builtins/steps/mapping/default/lib.sjs");
const mappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

function describe(item) {
  return xdmp.describe(item, Sequence.from([]), Sequence.from([]));
}

// set caches to avoid DB inserts
let customerMapping = fn.head(xdmp.unquote(`{
  "language" : "zxx",
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
    "sourcedFrom": "orders/order",
      "externalMapping": {
      "name": "OrderXML-CustomerXMLMapping",
        "version": 0
    }
  }
}
}`));
let orderMapping = fn.head(xdmp.unquote(`{
  "language" : "zxx",
  "name" : "OrderXML-CustomerXMLMapping",
  "description" : "",
  "version" : 0,
  "targetEntityType" : "Order-0.0.1/Order",
  "sourceContext" : "/",
  "sourceURI" : "",
  "properties" : {
    "OrderID": {
      "sourcedFrom": "@id"
    }
  }
}`));
defaultMappingLib.cachedMappingByNameAndVersion['CustomerXML-CustomerXMLMapping:0'] = customerMapping;
defaultMappingLib.cachedMappingByNameAndVersion['OrderXML-CustomerXMLMapping:0'] = orderMapping;

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
const expectedTemplate = fn.tail(xdmp.tidy(`
  <m:entity name="Customer" xmlns:m="http://marklogic.com/entity-services/mapping">
    <m:param name="context"><m:select>$context</m:select></m:param>
    <Customer>
      <ID><m:val>$context ! string(@CustomerID) ! xs:string(.)</m:val></ID>
      <m:optional><Date><m:val>$context ! parseDateTime('DD/MM/YYYY-hh:mm:ss', date) ! xs:dateTime(.)</m:val></Date></m:optional>
      <m:for-each><m:select>$context ! orders/order</m:select>
        <Orders datatype='array'>
          <m:call-template name="Order">
            <m:with-param name="$context" select="."/>
          </m:call-template>
        </Orders>
      </m:for-each>      
    </Customer>
  </m:entity>
`, { inputXml: 'yes'}));
[
  test.assertTrue(fn.deepEqual(expectedTemplate, template),
    `Entity template should build: ${describe(expectedTemplate)} got: ${describe(template)}`)
];
