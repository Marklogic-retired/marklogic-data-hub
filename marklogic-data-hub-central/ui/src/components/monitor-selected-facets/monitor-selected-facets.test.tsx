import React from "react";
import {render, waitForElement, fireEvent, wait} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  const {getByTestId, getByText, getByLabelText} = render(
    <MonitorSelectedFacets
      selectedFacets={[]}
      greyFacets={[{constraint: "Step Type", facet: "ingestion"}]}
      toggleApplyClicked={jest.fn()}
      toggleApply={jest.fn()}
      showApply={false}
      applyClicked={true}
    />,
  );
  let i: number;
  let greyFacet = getByTestId("clear-grey-ingestion");
  let discardButton = getByTestId("clear-all-grey-button");
  let applyButton = getByTestId("facet-apply-button");
  fireEvent.mouseOver(getByLabelText("clear-all-grey-button"));
  fireEvent.mouseOver(getByLabelText("facet-apply-button"));
  await(waitForElement(() => (getByText("Apply facets"))));
  fireEvent.mouseOver(discardButton);
  await(waitForElement(() => (getByText("Clear unapplied facets"))));

  const facetActions = [greyFacet, discardButton, applyButton];

  // verify element exists and can be focused
  facetActions.forEach((element, i) => async () => {
    element.focus();
    await wait(() => expect(element).toHaveFocus());
  });

  greyFacet.focus();

  // verify elements tab in given order
  for (i = 1; i < 3; ++i) {
    userEvent.tab();
    expect(facetActions[i]).toHaveFocus();
  }

  // verify elements tab backwards in same order
  for (i = 1; i >= 0; --i) {
    userEvent.tab({shift: true});
    expect(facetActions[i]).toHaveFocus();
  }
});
