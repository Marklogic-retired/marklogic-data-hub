import ResultsList from "./ResultsList";
import { SearchContext } from "../../store/SearchContext";
import { DetailContext } from "../../store/DetailContext";
import {render} from "@testing-library/react";
import userEvent from '@testing-library/user-event'

const resultsListConfig = {
    thumbnail: {
        src: "extracted.person.image",
        width: 100,
        height: 100,
        alt: "result thumbnail"
    },
    title: {
        path: "extracted.person.name",
        id: "extracted.person.id"
    },
    items: [
        { 
            component: "Address", 
            config: {
                city: "extracted.person.address.city",
                state: "extracted.person.address.state"
            }
        },
        { value: "extracted.person.phone", class: "phone"},
        { value: "extracted.person.ssn"}
    ],
    categories: "extracted.person.sources",
    timestamp: {
        value: "extracted.person.createdOn",
        type: "datetime",
        format: "yyyy-MM-dd",
        label: "Time is"
    },
    status: "extracted.person.status"
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
            }
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
            }
        }
    ]
};

const searchContextValue = {
    qtext: "",
    entityType: "",
    facetStrings: [],
    searchResults: searchResults,
    returned: 0,
    total: 0,
    handleSearch: jest.fn(),
    handleFacetString: jest.fn(),
    handleSaved: jest.fn()
};

const searchResultsEmpty = {};

const searchContextValueEmpty = {
    qtext: "",
    entityType: "",
    facetStrings: [],
    searchResults: searchResultsEmpty,
    returned: 0,
    total: 0,
    handleSearch: jest.fn(),
    handleFacetString: jest.fn(),
    handleSaved: jest.fn()
};

const detailContextValue = {
    detail: {},
    handleDetail: jest.fn()
};

describe("ResultsList component", () => {

    test("Verify list items appear and titles are clickable when results returned", () => {
        const {getByText, getAllByAltText} = render(
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
        userEvent.click(title);
        expect(detailContextValue.handleDetail).toHaveBeenCalledWith("101");
        userEvent.click(getByText("Jane Doe"));
        expect(detailContextValue.handleDetail).toHaveBeenCalledWith("102");
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
