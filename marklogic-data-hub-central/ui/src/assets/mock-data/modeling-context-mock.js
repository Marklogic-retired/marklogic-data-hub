
export const isModified = {
  modelingOptions: {
    isModified: true
  },
  toggleIsModified: jest.fn(),
}

export const notModified = {
  modelingOptions: {
    isModified: false
  },
  toggleIsModified: jest.fn(),
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
    ]
  }
}