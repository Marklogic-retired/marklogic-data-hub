import ResultsList from "./ResultsList";
import { SearchContext } from "../../store/SearchContext";
import { DetailContext } from "../../store/DetailContext";
import {render} from "@testing-library/react";
import userEvent from '@testing-library/user-event'

const resultsListConfig = {
    defaultIcon:{color: "lightgrey", type: "faCircle"},
    entities: {
        person: {
            thumbnail: {
                component: "Image",
                config: {
                    path: "extracted.person.image",
                    alt: "result thumbnail",
                    style: {
                        width: "70px",
                        height: "70px"
                    }
                }
            },
            title: {
                id: "uri",
                path: "extracted.person.name"
            },
            items: [
                {
                    component: "Address",
                    config: {
                        city: "extracted.person.address.city",
                        state: "extracted.person.address.state"
                    }
                },
                {
                    component: "Value",
                    config: {
                        path: "extracted.person.phone",
                        className: "phone"
                    }
                },
                {path: "extracted.person.ssn"}
            ],
            categories: {
                path: "extracted.person.sources",
                colors: {
                    "source1": "#d5e1de",
                    "source2": "#ebe1fa"
                }
            },
            timestamp: {
                path: "extracted.person.createdOn",
                type: "datetime",
                format: "yyyy-MM-dd",
                prefix: "Time is "
            },
            status: {path: "extracted.person.status"}
        }
    }
   
};

const searchResults = {
    "result": [
        {
            "extracted": {
                "person": {
                    "id": "101",
                    "name": "John Doe",
                    "phone": "123-456-7890",
                    "image": "http://example.org/entity.jpg",
                    "address": {
                        "city": "Anytown",
                        "state": "CA"
                    },
                    "status": "active",
                    "ssn": "123-45-6789",
                    "sources": ["source1", "source2"],
                    "createdOn": "2020-01-01T08:00:00-07:00"
                }
            },
            "entityType": "person",
            "uri": "/person/101.xml"
        },
        {
            "extracted": {
                "person": {
                    "id": "102",
                    "name": "Jane Doe",
                    "phone": "987-654-3210",
                    "status": "inactive",
                    "sources": [],
                    "createdOn": "1999-01-01T08:00:00"
                }
            },
            "entityType": "person",
            "uri": "/person/102.xml"
        }
    ]
};

const searchContextValue = {
    qtext: "",
    entityType: "",
    facetStrings: [],
    searchResults: searchResults,
    start: 0,
    pageLength: 10,
    returned: 0,
    total: 0,
    recentSearches: [],
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

const searchResultsEmpty = {};

const searchContextValueEmpty = Object.assign({}, searchContextValue, {searchResults: searchResultsEmpty});

const EXPANDIDS = {
    membership: true,
    info: true,
    relationships: true,
    imageGallery: true,
    timeline: true
}

const detailContextValue = {
    detail: {},
    recentRecords: [],
    loading: false,
    expandIds: EXPANDIDS,
    handleGetDetail: jest.fn(),
    handleGetRecent: jest.fn(),
    handleGetRecentLocal: jest.fn(),
    handleSaveRecent: jest.fn(),
    handleSaveRecentLocal: jest.fn(),
    handleExpandIds: jest.fn(),
    handleDeleteAllRecent: jest.fn(), 
    hasSavedRecords: jest.fn()
};

describe("ResultsList component", () => {

    test("Verify list items appear and titles are clickable when results returned", () => {
        const {getByText, getAllByAltText, debug} = render(
            <SearchContext.Provider value={searchContextValue}>
                <DetailContext.Provider value={detailContextValue}>
                    <ResultsList config={resultsListConfig} />
                </DetailContext.Provider>
            </SearchContext.Provider>
        );
        let title = getByText("John Doe");
        expect(getAllByAltText("result thumbnail")[0]).toBeInTheDocument(); // Image
        expect(title).toBeInTheDocument(); // Title
        expect(getByText("Anytown, CA")).toBeInTheDocument(); // Subtitle (address)
        expect(getByText("123-456-7890")).toBeInTheDocument(); // Subtitle 
        expect(getByText("123-45-6789")).toBeInTheDocument(); // Subtitle 
        expect(getByText("active")).toBeInTheDocument(); // Status
        expect(getByText("Time is 2020-01-01")).toBeInTheDocument(); // Timestamp
        debug();
        userEvent.click(title);
        expect(detailContextValue.handleGetDetail).toHaveBeenCalledWith(searchResults.result[0].uri);
        userEvent.click(getByText("Jane Doe"));
        expect(detailContextValue.handleGetDetail).toHaveBeenCalledWith(searchResults.result[1].uri);
    });

    test("Verify messaging appears when no results returned", () => {
        const {getByText} = render(
            <SearchContext.Provider value={searchContextValueEmpty}>
                <DetailContext.Provider value={detailContextValue}>
                    <ResultsList config={resultsListConfig} />
                </DetailContext.Provider>
            </SearchContext.Provider>
        );
        expect(getByText("No results")).toBeInTheDocument();
    });

});
