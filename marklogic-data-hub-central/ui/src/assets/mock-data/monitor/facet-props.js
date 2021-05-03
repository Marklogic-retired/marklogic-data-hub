export const flowNameFacetProps = {
  name: "flowName",
  displayName: "Flow Name",
  tooltip: "A sequence of one or more steps that process the data.",
  updateSelectedFacets: jest.fn(),
  addFacetValues: jest.fn(),
  facetValues: [
    {
      "name": "CurateCustomerWithRelatedEntitiesJSON",
      "value": "CurateCustomerWithRelatedEntitiesJSON"
    },
    {
      "name": "CurateClientJSON",
      "value": "CurateClientJSON"
    },
    {
      "name": "personJSON",
      "value": "personJSON"
    },
    {
      "name": "CurateCustomerXML",
      "value": "CurateCustomerXML"
    },
    {
      "name": "convertedFlow",
      "value": "convertedFlow"
    },
    {
      "name": "CurateCustomerJSON",
      "value": "CurateCustomerJSON"
    },
    {
      "name": "personXML",
      "value": "personXML"
    }
  ]
};

export const stepTypeFacetProps = {
  name: "Step Type",
  constraint: "Step Type",
  displayName: "Step Type",
  updateSelectedFacets: jest.fn(),
  addFacetValues: jest.fn(),
  facetValues: [
    {
      "name": "ingestion",
      "value": "ingestion"
    },
    {
      "name": "mapping",
      "value": "mapping"
    },
    {
      "name": "custom",
      "value": "custom"
    }
  ],
  tooltip: ""
};

export const stepNameFacetProps = {
  name: "Step",
  constraint: "Step",
  displayName: "Step",
  updateSelectedFacets: jest.fn(),
  addFacetValues: jest.fn(),
  facetValues: [
    {
      "name": "loadCustomersWithRelatedEntitiesJSON",
      "value": "loadCustomersWithRelatedEntitiesJSON"
    },
    {
      "name": "mapCustomersWithRelatedEntitiesJSON",
      "value": "mapCustomersWithRelatedEntitiesJSON"
    },
    {
      "name": "mapClientJSON",
      "value": "mapClientJSON"
    },
    {
      "name": "generate-dictionary",
      "value": "generate-dictionary"
    },
    {
      "name": "mapCustomersXML",
      "value": "mapCustomersXML"
    },
    {
      "name": "loadPersonJSON",
      "value": "loadPersonJSON"
    }
  ],
  tooltip: "Code that processes the data."
};
