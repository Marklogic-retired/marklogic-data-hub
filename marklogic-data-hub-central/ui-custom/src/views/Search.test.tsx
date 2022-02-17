import Search from "./Search";
import {render, act} from "@testing-library/react";
import { UserContext } from "../store/UserContext";
import config from '../../../src/main/resources/explore-data/ui-config/config.json';

const userContextValue = {
    userid: "",
    proxy: "",
    config: config,
    handleGetProxy: jest.fn(),
    handleGetUserid: jest.fn(),
    handleLogin: jest.fn(),
    handleGetConfig: jest.fn()
};

const userContextValueEmptyConfig = {...userContextValue, config: {}};

describe("Search view", () => {

    test("Renders configured content with non-empty config", async () => {
        let getByText, debug;
        await act(async () => {
            const renderResults = render(
                <UserContext.Provider value={userContextValue}>
                    <Search />
                </UserContext.Provider>
            );
            getByText = renderResults.getByText;
            debug = renderResults.debug;
        });
        expect(document.querySelector(".meter")).toBeInTheDocument();
        expect(getByText(config.search.facets.items[0].name)).toBeInTheDocument();
        expect(document.querySelector(".results")).toBeInTheDocument();
    });

    test("Renders loading content with empty config", async () => {
        let getByText, debug;
        await act(async () => {
            const renderResults = render(
                <UserContext.Provider value={userContextValueEmptyConfig}>
                    <Search />
                </UserContext.Provider>
            );
            getByText = renderResults.getByText;
            debug = renderResults.debug;
        });
        expect(getByText("Loading...")).toBeInTheDocument();
    });

});