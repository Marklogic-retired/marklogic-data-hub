import React from "react";
import {render, cleanup, fireEvent} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import GraphExploreSidePanel from "./graph-explore-side-panel";
import {SearchContext} from "../../../util/search-context";
import {BrowserRouter as Router} from "react-router-dom";
import {defaultSearchOptions} from "../../../assets/mock-data/explore/entity-search";

describe("Query Dropdown", () => {

  afterEach(cleanup);

  const defaultSavedNode ={entityName: "Order", primaryKey: {propertyValue: "1234"}, docUri: "10260.json", sources: "", entityInstance: {}, label: "1234"};
  test("Render graph side bar", () => {
    const {getByTestId} = render(
      <SearchContext.Provider value={{searchOptions: defaultSearchOptions, savedNode: defaultSavedNode}}>
        <Router>
          <GraphExploreSidePanel onCloseSidePanel={() => {}} graphView={true}/>
        </Router>
      </SearchContext.Provider>
    );
    const dropdown = getByTestId("graphSidePanel");
    expect(dropdown).toBeInTheDocument();
    const heading = getByTestId("entityHeading");
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toBe("Order1234");
    const uri = getByTestId("uriLabel");
    expect(uri).toBeInTheDocument();
    expect(uri.textContent).toBe("URI: 10260.json");
  });

  test("Render instance tab", () => {
    const {getByLabelText, getByText} = render(
      <SearchContext.Provider value={{searchOptions: defaultSearchOptions, savedNode: defaultSavedNode}}>
        <Router>
          <GraphExploreSidePanel onCloseSidePanel={() => {}} graphView={true}/>
        </Router>
      </SearchContext.Provider>
    );
    const instanceTab = getByLabelText("instanceTabInSidePanel");
    fireEvent.click(instanceTab);
    expect(getByText("Property")).toBeInTheDocument();
    expect(getByText("Value")).toBeInTheDocument();
    expect(getByLabelText("radio-button-expand")).toBeInTheDocument();
    expect(getByLabelText("radio-button-collapse")).toBeInTheDocument();
  });

});
