import React from "react";
import {render, waitForElement, fireEvent} from "@testing-library/react";
import MonitorSelectedFacets from "./monitor-selected-facets";


test("No Selected Facets", () => {
  const {getByTestId} = render(
    <MonitorSelectedFacets selectedFacets={[]}
      greyFacets={[]}
      toggleApplyClicked={jest.fn()}
      toggleApply={jest.fn()}
      showApply={false}
      applyClicked={false}/>,
  );
  const container = getByTestId("selected-facet-block");
  expect(container).toHaveStyle("visibility: hidden");
});

test("Selected Facets: facet selected", () => {
  const {getByTestId} = render(
    <MonitorSelectedFacets
      selectedFacets={[{constraint: "Step Type", facet: "ingestion"}]}
      greyFacets={[]}
      toggleApplyClicked={jest.fn()}
      toggleApply={jest.fn()}
      showApply={false}
      applyClicked={true}
    />,
  );
  let facetButton = getByTestId("clear-ingestion");
  expect(facetButton).toBeInTheDocument();
});

test("Grey Facets: Verify apply/discard icons", async () => {
  const {getByTestId, getByText} = render(
    <MonitorSelectedFacets
      selectedFacets={[]}
      greyFacets={[{constraint: "Step Type", facet: "ingestion"}]}
      toggleApplyClicked={jest.fn()}
      toggleApply={jest.fn()}
      showApply={false}
      applyClicked={true}
    />,
  );
  let discardButton = getByTestId("clear-all-grey-button");
  let applyButton = getByTestId("facet-apply-button");
  expect(discardButton).toBeInTheDocument();
  expect(applyButton).toBeInTheDocument();
  fireEvent.mouseOver(applyButton);
  await(waitForElement(() => (getByText("Apply facets"))));
  fireEvent.mouseOver(discardButton);
  await(waitForElement(() => (getByText("Clear unapplied facets"))));
});
