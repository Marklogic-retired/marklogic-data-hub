import React from "react";
import {render, cleanup} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import GraphExploreSidePanel from "./graph-explore-side-panel";
import {SearchContext} from "../../../util/search-context";
import {BrowserRouter as Router} from "react-router-dom";

describe("Query Dropdown", () => {

  afterEach(cleanup);

  const defaultSearchOptions = {selectedNode: {
    query: "",
    entityTypeIds: [],
    nextEntityType: "",
    start: 1,
    pageNumber: 1,
    pageLength: 20,
    pageSize: 20,
    selectedFacets: {},
    maxRowsPerPage: 100,
    selectedQuery: "select a query",
    zeroState: false,
    manageQueryModal: false,
    selectedTableProperties: [],
    view: null,
    sortOrder: [],
  }};

  const defaultSavedNode ={entityName: "Order", primaryKey: {propertyValue: "1234"}, uri: "10260.json", sources: "", entityInstance: {}};
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
    expect(heading.textContent).toBe("Order > 1234");
    const uri = getByTestId("uriLabel");
    expect(uri).toBeInTheDocument();
    expect(uri.textContent).toBe("URI: 10260.json");
  });

});