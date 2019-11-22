const defaultMappingLib = require("/data-hub/5/builtins/steps/mapping/default/lib.sjs");
const mappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");
const baseCustomerMapping = xdmp.toJSON({
  "lang" : "zxx",
  "name" : "CustomerXML-CustomerXMLMapping",
  "description" : "",
  "version" : 0,
  "targetEntityType" : "Customer-0.0.1/Customer",
  "sourceContext" : "/",
  "sourceURI" : "",
  "namespaces": {
    "ns2": "http://ns2",
    "ns1": "http://ns1"
  },
  "properties" : {
    "ID": {
      "sourcedFrom": "string(@CustomerID)"
    },
    "Date": {
      "sourcedFrom": "parseDateTime(date, 'DD/MM/YYYY-hh:mm:ss')"
    },
    "Orders": {
      "targetEntityType": "Order-0.0.1/Order",
      "sourcedFrom": "orders/order",
      "properties" : {
        "OrderID": {
          "sourcedFrom": "@id"
        }
      }
    },
    "Name": {
      "targetEntityType": "#/definitions/Name",
      "sourcedFrom": "customerName",
      "properties" : {
        "FirstName": {
          "sourcedFrom": "ns1:givenName"
        },
        "LastName": {
          "sourcedFrom": "ns2:surName"
        }
      }
    }
  }
});

defaultMappingLib.cachedMappingByNameAndVersion['CustomerXML-CustomerXMLMapping:0'] = baseCustomerMapping;

const baseCustomerEntityModel = {
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
        "Name": {
          "$ref": "#definitions/Name"
        },
        "Orders": {
          "datatype": "array",
          "items": { "$ref": "#definitions/Order" }
        }
      }
    },
    "Name": {
      "required": [],
      "properties": {
        "FirstName": { "datatype": "string" },
        "LastName": { "datatype": "string" }
      }
    }
  }
};

const baseOrderEntityModel = {
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
};
const assertions = [];

function describe(item) {
  return xdmp.describe(item, Sequence.from([]), Sequence.from([]));
}

function tidyXML(xmlStr) {
  return fn.head(fn.tail(xdmp.tidy(xmlStr, { inputXml: 'yes'})));
}

function applyDefOverrides(definitionName, baseModel, defOverrides) {
  return xdmp.toJSON(Object.assign({},baseModel, {
      "definitions": Object.assign({}, baseModel.definitions,{
        [definitionName]: Object.assign({}, baseModel.definitions[definitionName],defOverrides)
      })}));
/*
  // This can only be used in ML 10. :(
  return xdmp.toJSON({
    ...baseModel,
    "definitions": {
      ...baseModel.definitions,
      [definitionName]: {
        ...baseModel.definitions[definitionName],
        ...defOverrides
      }
    }
  });
 */
}

function applyDefOverridesAndSetCache(customerDefOverrides, orderDefOverrides) {
  let customerEntity = applyDefOverrides("Customer", baseCustomerEntityModel, customerDefOverrides);
  let orderEntity = applyDefOverrides("Order", baseOrderEntityModel, orderDefOverrides);
  defaultMappingLib.cachedEntityByTitleAndVersion['Customer:0.0.1'] = customerEntity;
  defaultMappingLib.cachedEntityByTitleAndVersion['Order:0.0.1'] = orderEntity;
  return {
    customerEntity,
    orderEntity
  };
}

function constructSingleTemplateWithOverrides(customerDefOverrides, orderDefOverrides) {
  const updatedEntities = applyDefOverridesAndSetCache(customerDefOverrides, orderDefOverrides);
  return tidyXML(mappingLib.buildEntityMappingXML(baseCustomerMapping.toObject(), updatedEntities.customerEntity.toObject()));
}

function constructEntireNestedTemplateWithOverrides(customerDefOverrides, orderDefOverrides) {
  const updatedEntities = applyDefOverridesAndSetCache(customerDefOverrides, orderDefOverrides);
  return tidyXML(xdmp.quote(mappingLib.buildMappingXML(baseCustomerMapping)));
}

/*
Per DHFPROD-2811, the "optional" is expected on the required ID element. If it's not marked as optional, and doesn't
have a value, then it will be added as ID:"". But that will not fail schema validation. Thus, by making it optional,
the "ID" property won't be included at all, which will properly fail schema validation.
 */
let expectedTemplate = tidyXML(`
  <m:entity name="Customer" xmlns:m="http://marklogic.com/entity-services/mapping">
    <Customer xmlns="" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <m:optional><ID xsi:type="xs:string"><m:val>string(@CustomerID)</m:val></ID></m:optional>
      <m:optional><Date xsi:type="xs:dateTime"><m:val>parseDateTime('DD/MM/YYYY-hh:mm:ss', date)</m:val></Date></m:optional>
      <m:for-each><m:select>orders/order</m:select>
        <Orders datatype='array'>
          <m:call-template name="Order"/>
        </Orders>
      </m:for-each>      
        <m:for-each><m:select>customerName</m:select>
          <Name>
            <m:call-template name="Name"/>
          </Name>
        </m:for-each>
    </Customer>
  </m:entity>
`);
let template = constructSingleTemplateWithOverrides({}, {});
assertions.push(
  test.assertTrue(fn.deepEqual(expectedTemplate, template),
    `Entity template should build: ${describe(expectedTemplate)} got: ${describe(template)}`)
);

// Namespace without prefix test
expectedTemplate = tidyXML(`
  <m:entity name="Customer" xmlns:m="http://marklogic.com/entity-services/mapping">
    <Customer xmlns="http://my-test-namespace" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <m:optional><ID xsi:type="xs:string"><m:val>string(@CustomerID)</m:val></ID></m:optional>
      <m:optional><Date xsi:type="xs:dateTime"><m:val>parseDateTime('DD/MM/YYYY-hh:mm:ss', date)</m:val></Date></m:optional>
      <m:for-each><m:select>orders/order</m:select>
        <Orders datatype='array'>
          <m:call-template name="Order"/>
        </Orders>
      </m:for-each>
      <m:for-each><m:select>customerName</m:select>
        <Name>
          <m:call-template name="Name"/>
        </Name>
      </m:for-each>
    </Customer>
  </m:entity>
`);
template = constructSingleTemplateWithOverrides({"namespace": "http://my-test-namespace", "namespacePrefix": ""}, {});
assertions.push(
  test.assertTrue(fn.deepEqual(expectedTemplate, template),
    `Entity template should build: ${describe(expectedTemplate)} got: ${describe(template)}`)
);

// Namespace with prefix test
expectedTemplate = tidyXML(`
  <m:entity name="Customer" xmlns:m="http://marklogic.com/entity-services/mapping">
    <myPrefix:Customer xmlns:myPrefix="http://my-test-namespace" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <m:optional><myPrefix:ID xsi:type="xs:string"><m:val>string(@CustomerID)</m:val></myPrefix:ID></m:optional>
      <m:optional><myPrefix:Date xsi:type="xs:dateTime"><m:val>parseDateTime('DD/MM/YYYY-hh:mm:ss', date)</m:val></myPrefix:Date></m:optional>
      <m:for-each><m:select>orders/order</m:select>
        <myPrefix:Orders datatype='array'>
          <m:call-template name="Order"/>
        </myPrefix:Orders>
      </m:for-each>      
      <m:for-each><m:select>customerName</m:select>
        <myPrefix:Name>
          <m:call-template name="Name"/>
        </myPrefix:Name>
      </m:for-each>      
    </myPrefix:Customer>
  </m:entity>
`);
template = constructSingleTemplateWithOverrides({"namespace": "http://my-test-namespace", "namespacePrefix": "myPrefix"}, {});
assertions.push(
  test.assertTrue(fn.deepEqual(expectedTemplate, template),
    `Entity template should build: ${describe(expectedTemplate)} got: ${describe(template)}`)
);

// Test entire build
expectedTemplate = tidyXML(`
  <m:mapping xmlns:m="http://marklogic.com/entity-services/mapping" xmlns:map="http://marklogic.com/xdmp/map" xmlns:ns1="http://ns1" xmlns:ns2="http://ns2">
    ${mappingLib.retrieveFunctionImports()}
    <m:entity name="Customer" xmlns:m="http://marklogic.com/entity-services/mapping">
      <Customer xmlns="" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <m:optional><ID xsi:type="xs:string"><m:val>string(@CustomerID)</m:val></ID></m:optional>
        <m:optional><Date xsi:type="xs:dateTime"><m:val>parseDateTime('DD/MM/YYYY-hh:mm:ss', date)</m:val></Date></m:optional>
        <m:for-each><m:select>orders/order</m:select>
          <Orders datatype='array'>
            <m:call-template name="Order"/>
          </Orders>
        </m:for-each>
        <m:for-each><m:select>customerName</m:select>
          <Name>
            <m:call-template name="Name"/>
          </Name>
        </m:for-each>      
      </Customer>
    </m:entity>
    <m:entity name="Order" xmlns:m="http://marklogic.com/entity-services/mapping">
      <Order xmlns="" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <m:optional><OrderID xsi:type="xs:string"><m:val>@id</m:val></OrderID></m:optional>
      </Order>
    </m:entity>
    <m:entity name="Name" xmlns:m="http://marklogic.com/entity-services/mapping">
      <Name xmlns="" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <m:optional><FirstName xsi:type="xs:string"><m:val>ns1:givenName</m:val></FirstName></m:optional>
        <m:optional><LastName xsi:type="xs:string"><m:val>ns2:surName</m:val></LastName></m:optional>
      </Name>
    </m:entity>
      <!-- Default entity is Customer -->
      <m:output>
        <m:for-each><m:select>/</m:select>
            <m:call-template name="Customer" />
        </m:for-each>
      </m:output>
    </m:mapping>
`);

template = constructEntireNestedTemplateWithOverrides({}, {});
assertions.push(
  test.assertTrue(fn.deepEqual(expectedTemplate, template),
    `Full template should build: ${describe(expectedTemplate)} got: ${describe(template)}`)
);
assertions;
