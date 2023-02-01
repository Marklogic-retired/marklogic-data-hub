import React from "react";
import {render, waitForElement, fireEvent} from "@testing-library/react";
import SelectedFacets from "./selected-facets";
import {SearchContext} from "@util/search-context";
import {searchContextInterfaceByDefault} from "@util/uiTestCommonInterface";


test("No Selected Facets", () => {
  const {getByTestId} = render(
    <SelectedFacets selectedFacets={[]}
      greyFacets={[]}
      toggleApplyClicked={jest.fn()}
      toggleApply={jest.fn()}
      showApply={false}
      applyClicked={false}/>,
  );
  const container = getByTestId("selected-facet-block");
  expect(container).toHaveStyle("visibility: hidden");
});

test("Selected Facets: String facet selected", () => {
  const {getByTestId} = render(
    <SelectedFacets
      selectedFacets={[{constraint: "Collection", facet: "productMapping"}]}
      greyFacets={[]}
      toggleApplyClicked={jest.fn()}
      toggleApply={jest.fn()}
      showApply={false}
      applyClicked={true}
    />,
  );
  let facetButton = getByTestId("clear-productMapping");
  expect(facetButton).toBeInTheDocument();
});

test("Selected Facets: Date facet selected", () => {
  const {getByText} = render(
    <SelectedFacets
      selectedFacets={[{constraint: "createdOnRange", facet: {
        rangeValues: {
          lowerBound: "2019-10-15",
          upperBound: "2019-11-10"
        }, stringValues: ["Custom"]}}]}
      greyFacets={[]}
      toggleApplyClicked={jest.fn()}
      toggleApply={jest.fn()}
      showApply={false}
      applyClicked={true}
    />,
  );
  expect(getByText(/2019-10-15 ~ 2019-11-10/i)).toBeInTheDocument();
});

test("Selected Facets: Date/time facet selected", () => {
  const {getByText} = render(
    <SelectedFacets
      selectedFacets={[{constraint: "OrderDate", rangeValues: {lowerBound: "2020-03-03T17:20:40", upperBound: "2020-03-05T17:40:20"}}]}
      greyFacets={[]}
      toggleApplyClicked={jest.fn()}
      toggleApply={jest.fn()}
      showApply={false}
      applyClicked={true}
    />,
  );
  expect(getByText(/OrderDate: 2020-03-03T17:20:40 ~ 2020-03-05T17:40:20/i)).toBeInTheDocument();
});

test("Selected Facets: Numeric facet selected", () => {
  const {getByText} = render(
    <SelectedFacets
      selectedFacets={[{constraint: "sliderMock", rangeValues: {lowerBound: 10, upperBound: 50}}]}
      greyFacets={[]}
      toggleApplyClicked={jest.fn()}
      toggleApply={jest.fn()}
      showApply={false}
      applyClicked={true}
    />,
  );
  expect(getByText(/sliderMock: 10 ~ 50/i)).toBeInTheDocument();
});

test("Grey Facets: Verify apply/discard icons", async () => {
  const {getByTestId, getByText} = render(
    <SearchContext.Provider value={{
      ...searchContextInterfaceByDefault,
      greyedOptions: {
        ...searchContextInterfaceByDefault.greyedOptions,
        selectedFacets: [{constraint: "Collection", facet: "productMapping"}]
      }
    }}>
      <SelectedFacets
        selectedFacets={[]}
        greyFacets={[{constraint: "Collection", facet: "productMapping"}]}
        toggleApplyClicked={jest.fn()}
        toggleApply={jest.fn()}
        showApply={false}
        applyClicked={true}
      />,
    </SearchContext.Provider>

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
