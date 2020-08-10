
export const isModified = {
  modelingOptions: {
    isModified: true,
    modifiedEntitiesArray: [
      {
        "entityName": "Order",
        "modelDefinition": {
          "Order": {
            "required": [],
            "pii": [
              "someProperty"
            ],
            "elementRangeIndex": [
              "someProperty"
            ],
            "rangeIndex": [
              "someOtherProperty"
            ],
            "properties": {
              "someProperty": {
                "datatype": "string",
                "collation": "http://marklogic.com/collation/codepoint"
              },
              "someOtherProperty": {
                "datatype": "string",
                "collation": "http://marklogic.com/collation/codepoint"
              },
              "zip": {
                "datatype": "string",
                "collation": "http://marklogic.com/collation/codepoint"
              }
            }
          }
        }
      }
    ]
  },
  clearEntityModified: jest.fn(),
  toggleIsModified: jest.fn(),
  setEntityTypeNamesArray: jest.fn()
}

export const notModified = {
  modelingOptions: {
    isModified: false
  },
  clearEntityModified: jest.fn(),
  toggleIsModified: jest.fn(),
  setEntityTypeNamesArray: jest.fn()
}

export const entityNamesArray = {
  modelingOptions: {
    entityTypeNamesArray: [
      {
        name: 'Concept',
        entityTypeId: 'http://marklogic.com/example/Concept-0.0.1/Concept'
      },
      {
        name: 'Order',
        entityTypeId: 'http://marklogic.com/example/Order-0.0.1/Order'
      },
      {
        name: 'Customer',
        entityTypeId: 'http://marklogic.com/example/Customer-0.0.1/Customer'
      }
    ],
    isModified: false,
    modifiedEntitiesArray: [],
  },
  updateEntityModified: jest.fn()
}

export const customerEntityNamesArray = {
  modelingOptions: {
    entityTypeNamesArray: [
      {
        name: 'Customer',
        entityTypeId: 'http://marklogic.com/example/Customer-0.0.1/Customer'
      }
    ]
  }
}