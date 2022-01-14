import React from "react";
import {render} from "@testing-library/react";
import EntitySpecificSidebar from "./entity-specific-sidebar";

const FNAME = {
  facetName: "Person.fname",
  type: "xs:string",
  facetValues: [{
    name: "Mark",
    count: 22,
    value: "Mark"
  }, {
    name: "Mary",
    count: 2,
    value: "Mary"
  }],
  referenceType: "path",
  entityTypeId: "http://example.org/Person-0.0.1/Person",
  propertyPath: "fname"
};

const UPDATE = {
  facetName: "Client.updated",
  type: "xs:dateTime",
  facetValues: [],
  referenceType: "path",
  entityTypeId: "http://example.org/Client-0.0.1/Client",
  propertyPath: "updated"
};

const LNAME = {
  facetName: "Person.lname",
  type: "xs:string",
  facetValues: [{
    name: "Adams Cole",
    count: 2,
    value: "Adams Cole"
  }],
  referenceType: "path",
  entityTypeId: "http://example.org/Person-0.0.1/Person",
  propertyPath: "lname"
};



const ADDRESS = {entity: {name: "Address", color: "#CEE0ED", amount: 10, filter: 2, icon: "faUser"}, entityFacets: [FNAME, LNAME, UPDATE]};
const CUSTOMER = {entity: {name: "Customer", color: "#EFE0ED", amount: 30, filter: 0, icon: "faVolleyballBall"}, entityFacets: []};

describe("Entity Specific Sidebar component", () => {
  it("can render base entity icons list only", () => {

    const {getByLabelText, getByText} =  render(
      <EntitySpecificSidebar
        entitySelected={ADDRESS}
        checkFacetRender={jest.fn()}
        facetRender={jest.fn()}
        updateSpecificFacets={false}
      />
    );
    expect(getByLabelText("specif-sidebar-Address")).toBeInTheDocument();
    expect(getByLabelText("specif-icon-Address")).toBeInTheDocument();
    expect(getByLabelText("specif-title-Address")).toBeInTheDocument();
    expect(getByText("Address")).toBeInTheDocument();
  });

  it("Empty facets", () => {
    const {getByLabelText} =  render(
      <EntitySpecificSidebar
        entitySelected={CUSTOMER}
        checkFacetRender={jest.fn()}
        facetRender={jest.fn()}
        updateSpecificFacets={false}
      />
    );
    expect(getByLabelText("no-facets-Customer")).toBeInTheDocument();
  });

  it("Display entity facets", () => {
    const {getByTestId} =  render(
      <EntitySpecificSidebar
        entitySelected={ADDRESS}
        checkFacetRender={jest.fn()}
        facetRender={jest.fn()}
        updateSpecificFacets={false}
      />
    );
    expect(getByTestId("facet-date-time-picker")).toBeInTheDocument();
    expect(getByTestId("lname-facet")).toBeInTheDocument();
    expect(getByTestId("fname-facet")).toBeInTheDocument();
  });

  it("Display search field", () => {
    const {getByLabelText} =  render(
      <EntitySpecificSidebar
        entitySelected={ADDRESS}
        checkFacetRender={jest.fn()}
        facetRender={jest.fn()}
        updateSpecificFacets={false}
      />
    );

    expect(getByLabelText("specif-search-field")).toBeInTheDocument();
  });
});