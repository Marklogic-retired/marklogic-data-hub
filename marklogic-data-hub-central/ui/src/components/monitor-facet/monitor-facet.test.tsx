import React from "react";
import {render, fireEvent, waitForElement} from "@testing-library/react";
import {flowNameFacetProps, stepNameFacetProps, stepTypeFacetProps} from "../../assets/mock-data/monitor/facet-props";
import MonitorFacet from "./monitor-facet";

describe("Facet component", () => {
  it("Facet component renders with data properly", async() => {
    const {getByTestId, getByText} = render(<MonitorFacet {...flowNameFacetProps} />);

    expect(getByText(/Flow/i)).toBeInTheDocument();

    expect(getByText(/CurateClientJSON/i)).toBeInTheDocument();
    expect(getByText(/personJSON/i)).toBeInTheDocument();

    fireEvent.click(getByTestId("show-more-flow-name"));
    // show extra facets
    expect(getByText(/CurateCustomerXML/i)).toBeInTheDocument();
    expect(getByText(/convertedFlow/i)).toBeInTheDocument();
    expect(getByText(/personXML/i)).toBeInTheDocument();

    fireEvent.mouseOver(getByTestId("info-tooltip-flowName"));
    await(waitForElement(() => (getByText("A sequence of one or more steps that process the data."))));
  });

  it("Collapse/Expand carets render properly for facet properties", () => {
    const {getByTestId} = render(<MonitorFacet {...flowNameFacetProps} />);

    expect(getByTestId("flow-name-toggle")).toBeInTheDocument();
    expect(document.querySelector("[data-testid=flow-name-toggle] i svg")).toBeInTheDocument();
    expect(document.querySelector("[data-testid=flow-name-toggle] i svg")).not.toHaveStyle("transform: rotate(-90deg);");
    fireEvent.click(getByTestId("flow-name-toggle"));
    expect(document.querySelector("[data-testid=flow-name-toggle] i svg")).toHaveStyle("transform: rotate(-90deg);");
  });

  it("Step Type facets renders properly", async () => {
    const {getByText} = render(<MonitorFacet {...stepTypeFacetProps} />);

    expect(getByText(/Step Type/i)).toBeInTheDocument();
    expect(getByText(/ingestion/i)).toBeInTheDocument();
    expect(getByText(/mapping/i)).toBeInTheDocument();
  });

  it("Step Name facets renders properly", async () => {
    const {getByText, getByTestId} = render(<MonitorFacet {...stepNameFacetProps} />);

    expect(getByText(/Step/i)).toBeInTheDocument();
    expect(getByText(/mapClientJSON/i)).toBeInTheDocument();
    expect(getByText(/loadCustomersWithRelatedEntitiesJSON/i)).toBeInTheDocument();

    fireEvent.mouseOver(getByTestId("info-tooltip-Step"));
    await(waitForElement(() => (getByText("Code that processes the data."))));
  });

});
