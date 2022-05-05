
import {render} from "@testing-library/react";
import {SearchContext} from "../../store/SearchContext";
import SelectedFacets from "./SelectedFacets";
const config = {
}

const searchContextValue = {
  qtext: "",
  entityType: "",
  facetStrings: ["sources:Los Angeles Times", "status:Active"],
  searchResults: {},
  start: 0,
  pageLength: 10,
  returned: 140,
  total: 240,
  recentSearches: [],
  loading: false,
  queryString: "",
  pageNumber: 1,
  sortOrder: "",
  handleSearch: () => { },
  handleFacetString: () => { },
  handleFacetDateRange: () => { },
  handlePagination: () => { },
  handleQueryFromParam: () => { },
  handleGetSearchLocal: () => { },
  setPageNumber: () => { },
  handleDeleteAllRecent: () => { },
  hasSavedRecords: () => { },
  handleSort: () => { },
};

describe("SummaryMeter", () => {
  it("Verify SummaryMeter is rendered", () => {
    const {getByTestId, getByText} = render(
      <SearchContext.Provider value={searchContextValue}>
        <SelectedFacets config={config} />
      </SearchContext.Provider>
    )
    expect(getByText("Los Angeles Times")).toBeInTheDocument();
    expect(getByText("Active")).toBeInTheDocument();
  });
});
