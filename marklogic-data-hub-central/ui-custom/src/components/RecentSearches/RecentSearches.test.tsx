import RecentSearches from "./RecentSearches";
import { SearchContext } from "../../store/SearchContext";
import { render } from "@testing-library/react";
import userEvent from '@testing-library/user-event'

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
    {qtext: "", facetStrings: ['sources:source1', 'status:active']},
    {qtext: "John A. Smith", facetStrings: []},
    {qtext: "ABC", facetStrings: ['sources:source2']}
];

const recentSearchesEmpty = [];

const searchContextValue = {
    qtext: "",
    entityType: "",
    facetStrings: [],
    searchResults: {},
    returned: 0,
    total: 0,
    recentSearches: recentSearches,
    loading: false,
    handleSearch: jest.fn(),
    handleFacetString: jest.fn(),
    handleSaved: jest.fn(),
    handleGetSearchLocal: jest.fn()
};

describe("RecentSearches component", () => {

    test("Verify queries and share icons appear and query is clickable when recent searches are returned", () => {
        const {getByText, queryAllByTestId} = render(
            <SearchContext.Provider value={searchContextValue}>
                <RecentSearches data={recentSearches} config={recentSearchesConfig} />
            </SearchContext.Provider>
        );
        let query = getByText(recentSearches[1].qtext);
        expect(query).toBeInTheDocument();
        expect(getByText(recentSearches[2].qtext)).toBeInTheDocument();
        expect(getByText(recentSearches[0].facetStrings[1])).toBeInTheDocument();
        expect(getByText(recentSearches[2].qtext)).toBeInTheDocument();
        expect(getByText(recentSearches[2].facetStrings[0])).toBeInTheDocument();
        expect(queryAllByTestId("share-icon")).toHaveLength(recentSearches.length);
        userEvent.click(query);
        expect(searchContextValue.handleSaved).toHaveBeenCalled();
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
