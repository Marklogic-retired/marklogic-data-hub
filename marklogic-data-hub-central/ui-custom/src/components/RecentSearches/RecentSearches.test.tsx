import RecentSearches from "./RecentSearches";
import {SearchContext} from "../../store/SearchContext";
import {render, fireEvent} from "@testing-library/react";
import userEvent from '@testing-library/user-event';

const recentSearchesConfig = {
    "cols": [
        {
            "title": "Search Criteria",
            "type": "query"
        },
        {
            "title": "Share",
            "type": "icon"
        }
    ]
};

const recentSearchesConfigNoShare = {
    "cols": [
        {
            "title": "Search Criteria",
            "type": "query"
        }
    ]
};

const recentSearches = [
    {
        searchText: "", selectedFacets: {sources: ["USA Today", "Los Angeles Times"]}, facetStrings: ['sources:source1', 'status:active'], entityTypeIds: ["person"]
    },
    {searchText: "John A. Smith", selectedFacets: {sources: ["Washington Post"]}, facetStrings: [], entityTypeIds: ["person"]},
    {searchText: "ABC", selectedFacets: {sources: ["Wall Street Journal"]}, facetStrings: ['sources:source2'], entityTypeIds: ["person"]}
];

const recentSearchesEmpty = [];

const searchContextValue = {
    qtext: "",
    entityType: "",
    facetStrings: [],
    searchResults: {},
    start: 0,
    pageLength: 10,
    returned: 0,
    total: 0,
    recentSearches: recentSearches,
    loading: false,
    queryString: "",
    pageNumber: 1,
    sortOrder: "",
    handleSearch: jest.fn(),
    handleFacetString: jest.fn(),
    handleFacetDateRange: jest.fn(),
    handlePagination: () => { },
    handleQueryFromParam: jest.fn(),
    handleSaved: jest.fn(),
    handleGetSearchLocal: jest.fn(),
    setPageNumber: () => { },
    handleDeleteAllRecent: jest.fn(),
    hasSavedRecords: jest.fn(),
    handleSort: jest.fn()
};

describe("RecentSearches component", () => {

    test("Verify queries and share icons appear and query is clickable when recent searches are returned", () => {
        const {getByText, getByTestId, queryAllByTestId} = render(
            <SearchContext.Provider value={searchContextValue}>
                <RecentSearches data={recentSearches} config={recentSearchesConfig} />
            </SearchContext.Provider>
        );
        let query = getByText(recentSearches[1].searchText);
        expect(query).toBeInTheDocument();
        expect(getByText(recentSearches[2].searchText)).toBeInTheDocument();
        expect(getByTestId("query-row-0")).toBeInTheDocument();
        expect(getByText(recentSearches[2].searchText)).toBeInTheDocument();
        expect(getByTestId("query-row-1")).toBeInTheDocument();
        expect(getByTestId("query-row-2")).toBeInTheDocument();
        expect(queryAllByTestId("share-icon")).toHaveLength(recentSearches.length);
    });

    test("Verify no share icons appear when not configured", () => {
        const {queryAllByTestId} = render(
            <RecentSearches data={recentSearches} config={recentSearchesConfigNoShare} />
        );
        expect(queryAllByTestId("share-icon")).toHaveLength(0);
    });

    test("Verify messaging appears when no recent searches are returned", () => {
        const {getByText} = render(
            <RecentSearches data={recentSearchesEmpty} config={recentSearchesConfig} />
        );
        expect(getByText("No recent searches found.")).toBeInTheDocument();
    });

});
