import Dashboard from "./Dashboard";
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

describe("Dashboard view", () => {

    test("Renders configured content with non-empty config", async () => {
        let getByText;
        await act(async () => {
            const renderResults = render(
                <UserContext.Provider value={userContextValue}>
                    <Dashboard />
                </UserContext.Provider>
            );
            getByText = renderResults.getByText;
        });
        expect(getByText(config.dashboard.metrics[0].title)).toBeInTheDocument();
        expect(getByText(config.dashboard.saved.cols[1].title!)).toBeInTheDocument();
    });

    test("Renders loading content with empty config", async () => {
        await act(async () => {
            const renderResults = render(
                <UserContext.Provider value={userContextValueEmptyConfig}>
                    <Dashboard />
                </UserContext.Provider>
            );
        });
        expect(document.querySelector(".loading")).toBeInTheDocument();
    });

});