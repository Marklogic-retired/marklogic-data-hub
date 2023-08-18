import React from "react";
import {render, fireEvent, waitForElement, wait} from "@testing-library/react";
import {
  flowNameFacetProps,
  stepNameFacetProps,
  stepTypeFacetProps,
  statusFacetProps,
} from "../../assets/mock-data/monitor/facet-props";
import MonitorFacet from "./monitor-facet";
import userEvent from "@testing-library/user-event";

describe("Facet component", () => {
  it("Facet component renders with data properly", async () => {
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
    await waitForElement(() => getByText("A sequence of one or more steps that process the data."));
  });

  it("Collapse/Expand carets render properly for facet properties", () => {
    const {getByLabelText} = render(<MonitorFacet {...flowNameFacetProps} />);

    expect(getByLabelText("icon: chevron-down")).toBeInTheDocument();
    fireEvent.click(getByLabelText("icon: chevron-down"));
    expect(getByLabelText("icon: chevron-right")).toBeInTheDocument();
  });

  it("Step Type facets renders properly", async () => {
    const {getByText} = render(<MonitorFacet {...stepTypeFacetProps} />);

    expect(getByText(/Step Type/i)).toBeInTheDocument();
    expect(getByText(/loading/i)).toBeInTheDocument();
    expect(getByText(/mapping/i)).toBeInTheDocument();
  });

  it("Step Name facets renders properly", async () => {
    const {getByText, getByTestId} = render(<MonitorFacet {...stepNameFacetProps} />);

    expect(getByText(/Step/i)).toBeInTheDocument();
    expect(getByText(/mapClientJSON/i)).toBeInTheDocument();
    expect(getByText(/loadCustomersWithRelatedEntitiesJSON/i)).toBeInTheDocument();

    fireEvent.mouseOver(getByTestId("info-tooltip-Step"));
    await waitForElement(() => getByText("Code that processes the data."));
  });

  it("Keyboard Navigation sequence is correct", async () => {
    const {getByTestId} = render(<MonitorFacet {...stepTypeFacetProps} />);

    let i: number;
    let clearFacet = getByTestId("step-type-clear");
    let toggleFacetPanel = getByTestId("step-type-toggle");
    let showMoreLink = getByTestId("show-more-step-type");
    let mappingType = getByTestId("step-type-mapping-checkbox");
    let loadingType = getByTestId("step-type-ingestion-checkbox");
    let customType = getByTestId("step-type-custom-checkbox");

    const facetActions = [clearFacet, toggleFacetPanel, loadingType, mappingType, customType, showMoreLink];

    // verify element exists and can be focused
    facetActions.forEach((element, i) => async () => {
      element.focus();
      await wait(() => expect(element).toHaveFocus());
    });

    clearFacet.focus();

    // verify elements tab in given order
    for (i = 1; i < 5; ++i) {
      userEvent.tab();
      expect(facetActions[i]).toHaveFocus();
    }

    // verify elements tab backwards in same order
    for (i = 3; i >= 0; --i) {
      userEvent.tab({shift: true});
      expect(facetActions[i]).toHaveFocus();
    }
  });

  it("Step Type facets renders properly", async () => {
    const {getByText, getByTestId} = render(<MonitorFacet {...statusFacetProps} />);
    userEvent.click(getByTestId("show-more-status"));
    expect(getByText(/Completed Successfully/i)).toBeInTheDocument();
    expect(getByText(/Running/i)).toBeInTheDocument();
    expect(getByText(/Failed/i)).toBeInTheDocument();
    expect(getByText(/Canceled/i)).toBeInTheDocument();
    expect(getByText(/Completed with Errors/i)).toBeInTheDocument();
  });
});
