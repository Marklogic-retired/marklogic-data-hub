import React from "react";
import {render, cleanup, fireEvent} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import BaseEntitiesFacet from "./base-entities-facet";
import {mockEntitiesProps, mockEntityIndicatorData, mockEntityIndicatorDataNoFilter} from "../../assets/mock-data/explore/base-entities-mock";

describe("Base Entities Facet", () => {


  afterEach(cleanup);

  test("Render base entities", () => {

    const {getByLabelText} = render(
      <BaseEntitiesFacet
        currentBaseEntities={[]}
        setCurrentBaseEntities={jest.fn()}
        setActiveAccordionRelatedEntities={jest.fn()}
        activeKey={["baseEntities"]}
        setEntitySpecificPanel={jest.fn()}
        allBaseEntities={mockEntitiesProps}
        entityIndicatorData={mockEntityIndicatorData}/>
    );
    const dropdown = getByLabelText("base-entities-dropdown-list");
    expect(dropdown).toBeInTheDocument();
  });

  test("Render base entities dropdown options", () => {
    const {getByLabelText} = render(
      <BaseEntitiesFacet
        currentBaseEntities={mockEntitiesProps}
        setCurrentBaseEntities={jest.fn()}
        setActiveAccordionRelatedEntities={jest.fn()}
        activeKey={["baseEntities"]}
        setEntitySpecificPanel={jest.fn()}
        allBaseEntities={mockEntitiesProps}
        entityIndicatorData={mockEntityIndicatorData}/>
    );
    const dropdown = getByLabelText("base-entities-dropdown-list");
    fireEvent.keyDown(dropdown, {key: "ArrowDown"});
    expect(getByLabelText("base-option-All Entities")).toBeInTheDocument();
  });

  test("Should render the filter, amount and quantity indicator in the entity selector", () => {
    const {getByLabelText} = render(
      <BaseEntitiesFacet
        currentBaseEntities={mockEntitiesProps}
        setCurrentBaseEntities={jest.fn()}
        setActiveAccordionRelatedEntities={jest.fn()}
        activeKey={["baseEntities"]}
        setEntitySpecificPanel={jest.fn()}
        allBaseEntities={mockEntitiesProps}
        entityIndicatorData={mockEntityIndicatorData}/>
    );
    expect(getByLabelText("base-entities-selection")).toBeInTheDocument();
    expect(getByLabelText("base-entities-Person-amountbar")).toBeInTheDocument();
    expect(getByLabelText("base-entities-Person-filter")).toHaveTextContent("(2 filters) 5");
  });

  test("Should render amount without filter word when filter prop with 0 value", () => {
    const {getByLabelText} = render(
      <BaseEntitiesFacet
        currentBaseEntities={mockEntitiesProps}
        setCurrentBaseEntities={jest.fn()}
        setActiveAccordionRelatedEntities={jest.fn()}
        activeKey={["baseEntities"]}
        setEntitySpecificPanel={jest.fn()}
        allBaseEntities={mockEntitiesProps}
        entityIndicatorData={mockEntityIndicatorDataNoFilter}/>
    );
    expect(getByLabelText("base-entities-selection")).toBeInTheDocument();
    expect(getByLabelText("base-entities-Person-filter")).toHaveTextContent("5");
  });
});
