const mappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");
const mappingStep = xdmp.toJSON(
  {
    "name": "mapCustomersJSON",
    "targetEntityType": "http://example.org/Customer-0.0.1/Customer",
    "stepDefinitionName": "entity-services-mapping",
    "stepDefinitionType": "mapping",
    "stepId": "mapCustomersJSON-mapping",
    "properties": {
      "customerId": {
        "sourcedFrom": "CustomerID"
      },
      "firstName": {
        "sourcedFrom": "Name/FirstName"
      },
      "lastName": {
        "sourcedFrom": "Name/LastName"
      }
    },
    "relatedEntityMappings": [
      {
        "relatedEntityMappingId": "productId:Order.lineItems.orderIncludes",
        "expressionContext": "/Orders/Products",
        "properties": {
          "productId": {
            "sourcedFrom": "ProductId"
          },
          "productName": {
            "sourcedFrom": "Name"
          }
        },
        "targetEntityType": "http://example.org/Product-1.0.0/Product"
      },
      {
        "relatedEntityMappingId": "orderedBy:Customer.customerId",
        "expressionContext": "/Orders",
        "properties": {
          "orderId": {
            "sourcedFrom": "OrderId"
          },
          "orderedBy": {
            "sourcedFrom": "../CustomerID"
          },
          "deliveredTo": {
            "sourcedFrom": "SendToID"
          },
          "lineItems": {
            "sourcedFrom": "Products",
            "properties": {
              "quantity": {
                "sourcedFrom": "Quantity"
              },
              "orderIncludes": {
                "sourcedFrom": "ProductId"
              }
            },
            "targetEntityType": "#/definitions/LineItem"
          }
        },
        "targetEntityType": "http://example.org/Order-0.0.1/Order"
      }
    ]
  }
);

const assertions = [];

function describe(item) {
  return xdmp.describe(item, Sequence.from([]), Sequence.from([]));
}

function tidyXML(xmlStr) {
  return fn.head(fn.tail(xdmp.tidy(xmlStr, { inputXml: 'yes'})));
}

function buildRelatedEntityMappingXML() {
  return tidyXML(xdmp.quote(mappingLib.buildMappingXML(mappingStep)));
}
function buildIndividualEntityTemplates(mappingObject, propertyPath, index, targetEntityType) {
  const entityModel = mappingLib.getTargetEntity(targetEntityType);
  return tidyXML(mappingLib.buildEntityTemplate(mappingObject, entityModel, propertyPath, index));
}
let mappingStepObj = fn.head(mappingStep).toObject();
const namespaces = {"m": "http://marklogic.com/entity-services/mapping"};
let expectedCustomerTemplate = tidyXML(`
<m:entity name="mapping0-Customer" xmlns:m="http://marklogic.com/entity-services/mapping">
  <Customer xmlns="" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <m:optional>
    <customerId xsi:type="xs:integer" xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <m:val>CustomerID</m:val>
    </customerId>
    </m:optional>
    <m:optional>
    <firstName xsi:type="xs:string" xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <m:val>Name/FirstName</m:val>
    </firstName>
    </m:optional>
    <m:optional>
    <lastName xsi:type="xs:string" xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <m:val>Name/LastName</m:val>
    </lastName>
    </m:optional>
  </Customer>
</m:entity>`)

//'index' value 0 implies mapping for the targetEntityType. 'index' > 1  mapping for relatedEntities.
let actualCustomerTemplate = buildIndividualEntityTemplates(mappingStepObj, "Customer",  0, mappingStepObj.targetEntityType);

assertions.push(
  test.assertTrue(fn.deepEqual(expectedCustomerTemplate, actualCustomerTemplate),
    `Customer entity template should build: ${describe(expectedCustomerTemplate)} got: ${describe(actualCustomerTemplate)}`),
  test.assertEqual("mapping0-Customer", actualCustomerTemplate.xpath("/m:entity/@name/string()", namespaces), "Target entity mapping is prefixed by 'mapping0-'")
);
let expectedProductTemplate = tidyXML(`
<m:entity name="mapping1-Product" xmlns:m="http://marklogic.com/entity-services/mapping">
  <Product xmlns="" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <m:optional>
    <productId xsi:type="xs:integer" xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <m:val>ProductId</m:val>
    </productId>
    </m:optional>
    <m:optional>
    <productName xsi:type="xs:string" xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <m:val>Name</m:val>
    </productName>
    </m:optional>
  </Product>
</m:entity>`)
let actualProductTemplate = buildIndividualEntityTemplates(mappingStepObj.relatedEntityMappings[0], "Product", 1, mappingStepObj.relatedEntityMappings[0].targetEntityType);

assertions.push(
  test.assertTrue(fn.deepEqual(expectedProductTemplate, actualProductTemplate),
    `Product entity template should build: ${describe(expectedProductTemplate)} got: ${describe(actualProductTemplate)}`)
);

let expectedOrderTemplate = tidyXML(`
<m:entity name="mapping2-Order" xmlns:m="http://marklogic.com/entity-services/mapping">
  <Order xmlns="" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <m:optional>
    <orderId xsi:type="xs:integer" xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <m:val>OrderId</m:val>
    </orderId>
    </m:optional>
    <m:optional>
    <orderedBy xsi:type="xs:integer" xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <m:val>../CustomerID</m:val>
    </orderedBy>
    </m:optional>
    <m:optional>
    <deliveredTo xsi:type="xs:integer" xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <m:val>SendToID</m:val>
    </deliveredTo>
    </m:optional>
    <m:for-each>
    <m:select>Products</m:select>
    <lineItems datatype="array">
    <m:call-template name="mapping2-Order.lineItems"/>
    </lineItems>
    </m:for-each>
  </Order>
</m:entity>`)
let actualOrderTemplate = buildIndividualEntityTemplates(mappingStepObj.relatedEntityMappings[1], "Order", 2, mappingStepObj.relatedEntityMappings[1].targetEntityType);
assertions.push(
  test.assertTrue(fn.deepEqual(expectedOrderTemplate, actualOrderTemplate),
    `Order entity template should build: ${describe(expectedOrderTemplate)} got: ${describe(actualOrderTemplate)}`),
test.assertEqual("mapping2-Order", actualOrderTemplate.xpath("/m:entity/@name/string()", namespaces), "Related entity mapping is prefixed by 'mapping{num}-' where num is a number > 0")
);

//The mapping for structured property should have the prefix as well
let lineItemsExpectedTemplate = tidyXML(`
<m:entity name="mapping2-Order.lineItems" xmlns:m="http://marklogic.com/entity-services/mapping">
  <LineItem xmlns="" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <m:optional>
    <quantity xsi:type="xs:integer" xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <m:val>Quantity</m:val>
    </quantity>
    </m:optional>
    <m:optional>
    <orderIncludes xsi:type="xs:integer" xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <m:val>ProductId</m:val>
    </orderIncludes>
    </m:optional>
  </LineItem>
</m:entity>
`)
let actualLineItemsTemplate = buildIndividualEntityTemplates(mappingStepObj.relatedEntityMappings[1].properties.lineItems, "Order.lineItems", 2, mappingStepObj.relatedEntityMappings[1].targetEntityType);

assertions.push(
  test.assertTrue(fn.deepEqual(lineItemsExpectedTemplate, actualLineItemsTemplate),
    `Order.lineItems entity template should build: ${describe(lineItemsExpectedTemplate)} got: ${describe(actualLineItemsTemplate)}`),
  test.assertEqual("mapping2-Order.lineItems", actualLineItemsTemplate.xpath("/m:entity/@name/string()", namespaces), "Structured property of Order's mapping should have the right value for attribute name (same as 'call-template name' in 'Order' mapping)")
);

let expectedFullTemplate = tidyXML(`
<m:mapping xmlns:m="http://marklogic.com/entity-services/mapping" xmlns:map="http://marklogic.com/xdmp/map" xmlns:instance="http://marklogic.com/datahub/entityInstance" xmlns:ns1="http://ns1" xmlns:ns2="http://ns2">
   ${mappingLib.retrieveFunctionImports()}
   <m:param name="URI" />
   <m:entity name="mapping0-Customer">
      <Customer xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
         <m:optional>
            <customerId xmlns:xs="http://www.w3.org/2001/XMLSchema" xsi:type="xs:integer">
               <m:val>CustomerID</m:val>
            </customerId>
         </m:optional>
         <m:optional>
            <firstName xmlns:xs="http://www.w3.org/2001/XMLSchema" xsi:type="xs:string">
               <m:val>Name/FirstName</m:val>
            </firstName>
         </m:optional>
         <m:optional>
            <lastName xmlns:xs="http://www.w3.org/2001/XMLSchema" xsi:type="xs:string">
               <m:val>Name/LastName</m:val>
            </lastName>
         </m:optional>
      </Customer>
   </m:entity>
   <m:entity name="mapping1-Product">
      <Product xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
         <m:optional>
            <productId xmlns:xs="http://www.w3.org/2001/XMLSchema" xsi:type="xs:integer">
               <m:val>ProductId</m:val>
            </productId>
         </m:optional>
         <m:optional>
            <productName xmlns:xs="http://www.w3.org/2001/XMLSchema" xsi:type="xs:string">
               <m:val>Name</m:val>
            </productName>
         </m:optional>
      </Product>
   </m:entity>
   <m:entity name="mapping2-Order">
      <Order xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
         <m:optional>
            <orderId xmlns:xs="http://www.w3.org/2001/XMLSchema" xsi:type="xs:integer">
               <m:val>OrderId</m:val>
            </orderId>
         </m:optional>
         <m:optional>
            <orderedBy xmlns:xs="http://www.w3.org/2001/XMLSchema" xsi:type="xs:integer">
               <m:val>../CustomerID</m:val>
            </orderedBy>
         </m:optional>
         <m:optional>
            <deliveredTo xmlns:xs="http://www.w3.org/2001/XMLSchema" xsi:type="xs:integer">
               <m:val>SendToID</m:val>
            </deliveredTo>
         </m:optional>
         <m:for-each>
            <m:select>Products</m:select>
            <lineItems datatype="array">
               <m:call-template name="mapping2-Order.lineItems" />
            </lineItems>
         </m:for-each>
      </Order>
   </m:entity>
   <m:entity name="mapping2-Order.lineItems">
      <LineItem xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
         <m:optional>
            <quantity xmlns:xs="http://www.w3.org/2001/XMLSchema" xsi:type="xs:integer">
               <m:val>Quantity</m:val>
            </quantity>
         </m:optional>
         <m:optional>
            <orderIncludes xmlns:xs="http://www.w3.org/2001/XMLSchema" xsi:type="xs:integer">
               <m:val>ProductId</m:val>
            </orderIncludes>
         </m:optional>
      </LineItem>
   </m:entity>
   <m:output>
      <instance:entityInstance0>
         <m:for-each>
            <m:select>/</m:select>
            <m:call-template name="mapping0-Customer" />
         </m:for-each>
      </instance:entityInstance0>
      <instance:entityInstance1>
         <m:for-each>
            <m:select>/Orders/Products</m:select>
            <m:call-template name="mapping1-Product" />
         </m:for-each>
      </instance:entityInstance1>
      <instance:entityInstance2>
         <m:for-each>
            <m:select>/Orders</m:select>
            <m:call-template name="mapping2-Order" />
         </m:for-each>
      </instance:entityInstance2>
   </m:output>
</m:mapping>

`);

let actualFullTemplate = buildRelatedEntityMappingXML();
assertions.push(
  test.assertTrue(fn.deepEqual(expectedFullTemplate, actualFullTemplate),
    `Full template should build: ${describe(expectedFullTemplate)} got: ${describe(actualFullTemplate)}`)
);
assertions;
