
import {ViewType, ModelingContextInterface} from "../../../types/modeling-types";

export const isModified: ModelingContextInterface = {
  modelingOptions: {
    entityPropertiesNamesArray: [],
    isModified: true,
    entityTypeNamesArray: ["Order"],
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
    ],
    view: ViewType.graph,
    selectedEntity: "Order",
    openSidePanelInGraphView: true
  },
  toggleIsModified: jest.fn(),
  setEntityTypeNamesArray: jest.fn(),
  setEntityPropertiesNamesArray: jest.fn(),
  updateEntityModified: jest.fn(),
  removeEntityModified: jest.fn(),
  clearEntityModified: jest.fn(),
  setView: jest.fn(),
  setSelectedEntity: jest.fn(),
  setGraphViewOptions: jest.fn(),
  closeSidePanelInGraphView: jest.fn()
};

export const isModifiedTableView = {
  modelingOptions: {
    entityPropertiesNamesArray: [],
    isModified: true,
    entityTypeNamesArray: ["Order"],
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
    ],
    view: ViewType.table,
    selectedEntity: "Order",
    openSidePanelInGraphView: true,

    toggleIsModified: jest.fn(),
    setEntityTypeNamesArray: jest.fn(),
    setEntityPropertiesNamesArray: jest.fn(),
    updateEntityModified: jest.fn(),
    removeEntityModified: jest.fn(),
    clearEntityModified: jest.fn(),
    setView: jest.fn(),
    setSelectedEntity: jest.fn(),
    setGraphViewOptions: jest.fn(),
    closeSidePanelInGraphView: jest.fn()
  },
  toggleIsModified: jest.fn(),
  setEntityTypeNamesArray: jest.fn(),
  updateEntityModified: jest.fn(),
  removeEntityModified: jest.fn(),
  clearEntityModified: jest.fn(),
  setView: jest.fn(),
  setSelectedEntity: jest.fn(),
  setGraphViewOptions: jest.fn(),
  closeSidePanelInGraphView: jest.fn(),
  setEntityPropertiesNamesArray: jest.fn(),

};

export const notModified = {
  modelingOptions: {
    isModified: false,
    view: ViewType.table,
    entityPropertiesNamesArray: [],
    entityTypeNamesArray: [],
    modifiedEntitiesArray: [],
    openSidePanelInGraphView: true,
  },
  clearEntityModified: jest.fn(),
  toggleIsModified: jest.fn(),
  setEntityTypeNamesArray: jest.fn(),
  setView: jest.fn(),
  setSelectedEntity: jest.fn(),
  setGraphViewOptions: jest.fn(),
  closeSidePanelInGraphView: jest.fn(),
  setEntityPropertiesNamesArray: jest.fn(),
  updateEntityModified: jest.fn(),
  removeEntityModified: jest.fn(),
};

export const notModifiedTableView: ModelingContextInterface = {
  modelingOptions: {
    isModified: false,
    view: ViewType.table,
    entityPropertiesNamesArray: [],
    entityTypeNamesArray: [],
    modifiedEntitiesArray: [],
    openSidePanelInGraphView: true,
  },
  clearEntityModified: jest.fn(),
  toggleIsModified: jest.fn(),
  setEntityTypeNamesArray: jest.fn(),
  setView: jest.fn(),
  setSelectedEntity: jest.fn(),
  setGraphViewOptions: jest.fn(),
  setEntityPropertiesNamesArray: jest.fn(),
  updateEntityModified: jest.fn(),
  removeEntityModified: jest.fn(),
  closeSidePanelInGraphView: jest.fn()
};

export const entityNamesArray = {
  modelingOptions: {
    entityTypeNamesArray: [
      {
        name: "Concept",
        entityTypeId: "http://marklogic.com/example/Concept-0.0.1/Concept"
      },
      {
        name: "Order",
        entityTypeId: "http://marklogic.com/example/Order-0.0.1/Order"
      },
      {
        name: "Customer",
        entityTypeId: "http://marklogic.com/example/Customer-0.0.1/Customer"
      }
    ],
    isModified: false,
    modifiedEntitiesArray: [],
    entityPropertiesNamesArray: ["Order", "Address", "address", "city", "state", "zip", "OrderDetails"],

    view: ViewType.graph,
    selectedEntity: "",
    openSidePanelInGraphView: false
  },
  updateEntityModified: jest.fn(),
  setEntityPropertiesNamesArray: jest.fn(),
  toggleIsModified: jest.fn(),
  removeEntityModified: jest.fn(),
  clearEntityModified: jest.fn(),
  setView: jest.fn(),
  setSelectedEntity: jest.fn(),
  setGraphViewOptions: jest.fn(),
  closeSidePanelInGraphView: jest.fn(),
  setEntityTypeNamesArray: jest.fn(),
};

export const customerEntityNamesArray = {
  modelingOptions: {
    entityTypeNamesArray: [
      {
        name: "Customer",
        entityTypeId: "http://marklogic.com/example/Customer-0.0.1/Customer"
      }
    ],
    entityPropertiesNamesArray: ["Customer", "Billing", "address", "city", "state", "zip", "Address", "Zip", "Shipping"],
    isModified: false,
    modifiedEntitiesArray: [],
    view: ViewType.graph,
    selectedEntity: "",
    openSidePanelInGraphView: false
  },
  updateEntityModified: jest.fn(),
  setEntityPropertiesNamesArray: jest.fn(),
  toggleIsModified: jest.fn(),
  removeEntityModified: jest.fn(),
  clearEntityModified: jest.fn(),
  setView: jest.fn(),
  setSelectedEntity: jest.fn(),
  setGraphViewOptions: jest.fn(),
  closeSidePanelInGraphView: jest.fn(),
  setEntityTypeNamesArray: jest.fn(),
};