import SearchBox from "./SearchBox";
import { SearchContext } from "../../store/SearchContext";
import {render, act, cleanup} from "@testing-library/react";
import userEvent from '@testing-library/user-event'

const searchContextValue = {
    qtext: "",
    entityType: "",
    facetStrings: [],
    searchResults: {},
    returned: 0,
    total: 0,
    handleSearch: jest.fn(),
    handleFacetString: jest.fn(),
    handleSaved: jest.fn()
};

const menuConfig = { 
    items: [
        {
            label: "All",
            value: ["ent1", "ent2"]
        },
        {
            label: "Default Item",
            value: "ent1",
            default: true
        },
        {
            label: "Another Item",
            value: "ent2"
        }
    ]
};

describe("SearchBox component", () => {

    test("Verify search box appears and query can be entered and submitted", () => {
        const {getByTestId} = render(
            <SearchContext.Provider value={searchContextValue}>
                <SearchBox />
            </SearchContext.Provider>
        );
        let searchBox = getByTestId("searchBox");
        expect(searchBox).toBeInTheDocument();
        expect(getByTestId("searchIcon")).toBeInTheDocument();
        let typedVal = "search string";
        userEvent.type(searchBox, typedVal);
        expect(searchBox).toHaveValue(typedVal);
        userEvent.type(searchBox, "{enter}");
        expect(searchContextValue.handleSearch).toHaveBeenCalledWith("search string", "");
    });

    test("Verify menu appears with default item selected, menu is selectable, and query can be submitted", async () => {
        let getByText, getByTestId;
        await act(async () => {
            const renderResults = render(
                <SearchContext.Provider value={searchContextValue}>
                    <SearchBox config={menuConfig} />
                </SearchContext.Provider>
            );
            getByText = renderResults.getByText;
            getByTestId = renderResults.getByTestId;
        });
        expect(document.querySelector("#searchBoxDropdown")!.innerHTML).toEqual("Default Item");
        act(() => {
            userEvent.click(document.querySelector("#searchBoxDropdown")!);
            userEvent.click(getByText("Another Item"));
        });
        expect(document.querySelector("#searchBoxDropdown")!.innerHTML).toEqual("Another Item");
        let searchBox = getByTestId("searchBox");
        userEvent.type(searchBox, "{enter}");
        expect(searchContextValue.handleSearch).toHaveBeenCalledWith("", "ent2");
    });

    test("Verify submit button appears when configured and is clickable", () => {
        const {getByTestId, queryByTestId, debug} = render(
            <SearchContext.Provider value={searchContextValue}>
                <SearchBox button="vertical" />
            </SearchContext.Provider>
        );
        expect(getByTestId("searchBox")).toBeInTheDocument();
        let submitButton = getByTestId("submit");
        expect(submitButton).toBeInTheDocument();
        expect(queryByTestId("searchIcon")).not.toBeInTheDocument(); // No search icon when button present
        expect(document.querySelector("#searchBoxDropdown")).not.toBeInTheDocument();
        userEvent.click(submitButton);
        expect(searchContextValue.handleSearch).toHaveBeenCalledWith("", "");
    });

});
