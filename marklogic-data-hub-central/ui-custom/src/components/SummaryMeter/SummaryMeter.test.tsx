
import {render} from "@testing-library/react";
import {SearchContext} from "../../store/SearchContext";
import SummaryMeter from "./SummaryMeter";
const config = {
  colors: {
    all: "#cccccc",
    filters: "#1ACCA8"
  },
  totalPath: "searchResults.recordCount.total"
}

const searchContextValue = {
  qtext: "",
  entityType: "",
  facetStrings: [],
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
        <SummaryMeter config={config} />
      </SearchContext.Provider>
    )
    expect(getByTestId("summaryMeterId")).toBeInTheDocument();
    expect(getByText("All results")).toBeInTheDocument();
    expect(getByText("With filters applied")).toBeInTheDocument();
    expect(getByText("140")).toBeInTheDocument();
    expect(getByText("240")).toBeInTheDocument();
  });
});
