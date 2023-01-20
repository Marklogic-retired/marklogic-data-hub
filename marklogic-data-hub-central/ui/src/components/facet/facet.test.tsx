import React from "react";
import {render, fireEvent, waitForElement, wait} from "@testing-library/react";
import Facet from "./facet";
import {facetProps, sourceNameFacetProps, sourceTypeFacetProps} from "../../assets/mock-data/explore/facet-props";
import userEvent from "@testing-library/user-event";

describe("Facet component", () => {
  it("Facet component renders with data properly", () => {
    const {getByTestId, getByText, queryByLabelText} = render(<Facet {...facetProps} />);

    expect(getByText(/sales_region/i)).toBeInTheDocument();

    expect(getByText(/Customer/i)).toBeInTheDocument();
    expect(getByText(/50/i)).toBeInTheDocument();
    expect(getByText(/OrderDetail/i)).toBeInTheDocument();
    expect(getByText(/15,000/i)).toBeInTheDocument();

    fireEvent.click(getByTestId("show-more-sales_region"));
    // show extra facets
    expect(getByText(/ProductDetail/i)).toBeInTheDocument();
    expect(getByText(/4,095/i)).toBeInTheDocument();
    expect(getByText(/Protein/i)).toBeInTheDocument();
    expect(getByText(/607/i)).toBeInTheDocument();
    expect(getByText(/CustomerType/i)).toBeInTheDocument();
    expect(getByText(/999/i)).toBeInTheDocument();
    // Search link not shown for facets < 20
    expect(queryByLabelText("popover-search-label")).not.toBeInTheDocument();

  });

  it("Facet component renders with nested data properly", () => {
    const {getByTestId, getByText, queryByText} = render(<Facet {...facetProps} name="Sales.sales_region" constraint="Sales.sales_region" />);

    expect(getByText(/Customer/i)).toBeInTheDocument();
    expect(getByText(/50/i)).toBeInTheDocument();
    expect(getByText(/OrderDetail/i)).toBeInTheDocument();
    expect(getByText(/15,000/i)).toBeInTheDocument();

    // path should not show sales > ... > sales_region
    expect(queryByText(/\.\.\./)).not.toBeInTheDocument();

    fireEvent.click(getByTestId("show-more-sales.sales_region"));
    // show extra facets
    expect(getByText(/ProductDetail/i)).toBeInTheDocument();
    expect(getByText(/4,095/i)).toBeInTheDocument();
    expect(getByText(/Protein/i)).toBeInTheDocument();
    expect(getByText(/607/i)).toBeInTheDocument();
    expect(getByText(/CustomerType/i)).toBeInTheDocument();
    expect(getByText(/999/i)).toBeInTheDocument();
  });

  it("Facet component shortens long name paths in structured properties", () => {
    const {getByText, queryByText} = render(<Facet {...facetProps} name="client.shipping.address.state"/>);

    // facet name should show client > ... > state
    expect(getByText(/client/)).toBeInTheDocument();
    expect(getByText(/state/)).toBeInTheDocument();
    expect(getByText(/\.\.\./)).toBeInTheDocument();

    // paths in the middle should be omitted
    expect(queryByText(/shipping/)).not.toBeInTheDocument();
    expect(queryByText(/address/)).not.toBeInTheDocument();
  });

  it("Collapse/Expand carets render properly for facet properties", () => {
    const {getByTestId, getByLabelText} = render(<Facet {...facetProps} />);

    expect(getByTestId("sales_region-toggle")).toBeInTheDocument();
    expect(getByLabelText("icon: chevron-down")).toBeInTheDocument();
    fireEvent.click(getByLabelText("icon: chevron-down"));
    expect(getByLabelText("icon: chevron-right")).toBeInTheDocument();
  });

  it("Search link shown only when facet number greater than limit", () => {
    const LIMIT =  20,
      facetValsNew: any = [];
    for (let i = 0; i < LIMIT; i++) {
      facetValsNew.push({"name": "fName", "count": 1, "value": "fVal"});
    }
    const {getByLabelText, queryByLabelText, rerender} = render(<Facet {...facetProps} />);

    // Search link NOT shown for facets < LIMIT
    expect(queryByLabelText("sales_region-popover-search-label")).not.toBeInTheDocument();

    rerender(<Facet {...facetProps} facetValues={facetValsNew}/>);

    // Search link shown for facets >= LIMIT
    expect(getByLabelText("sales_region-popover-search-label")).toBeInTheDocument();
  });

  it("SourceName facets renders properly", async () => {
    const {getByText, getByTestId} = render(<Facet {...sourceNameFacetProps} />);

    expect(getByText(/SourceName/i)).toBeInTheDocument();
    expect(getByText(/loadPersonJSON/i)).toBeInTheDocument();
    expect(getByText(/14/i)).toBeInTheDocument();
    expect(getByText(/ingest-orders/i)).toBeInTheDocument();
    expect(getByText(/12/i)).toBeInTheDocument();

    fireEvent.mouseOver(getByTestId("info-tooltip-SourceName"));
    await(waitForElement(() => (getByText("The name of the source of the files."))));

    let i: number;

    let clearFacet = getByTestId("sourcename-clear");
    let sourceNameTooltip = getByTestId("SourceName-facet-tooltip");
    let toggleFacetPanel = getByTestId("sourcename-toggle");
    let showMoreLink = getByTestId("span-show-more-sourcename");
    let loadPersonJSONSourceName = getByTestId("sourcename-loadPersonJSON-checkbox");
    let ingestOrdersSourceName = getByTestId("sourcename-ingest-orders-checkbox");

    const facetActions = [sourceNameTooltip, clearFacet, toggleFacetPanel, loadPersonJSONSourceName, ingestOrdersSourceName, showMoreLink];

    // verify element exists and can be focused
    facetActions.forEach((element, i) => async () => {
      element.focus();
      await wait(() => expect(element).toHaveFocus());
    });

    sourceNameTooltip.focus();

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

  it("SourceType facets renders properly", async () => {
    const {getByText, getByTestId} = render(<Facet {...sourceTypeFacetProps} />);

    expect(getByText(/SourceType/i)).toBeInTheDocument();
    expect(getByText(/loadPerson/i)).toBeInTheDocument();
    expect(getByText(/20/i)).toBeInTheDocument();
    expect(getByText(/ingestOrders/i)).toBeInTheDocument();
    expect(getByText(/5/i)).toBeInTheDocument();

    fireEvent.mouseOver(getByTestId("info-tooltip-SourceType"));
    await(waitForElement(() => (getByText("The type of source of the files."))));
  });

});
