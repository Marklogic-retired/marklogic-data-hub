import Dashboard from "./Dashboard";
import {render, act} from "@testing-library/react";
import { UserContext } from "../store/UserContext";

const config = {
    "dashboard": {
        "metrics": {
            "component": "Metrics",
            "config": {
                "items": [
                    {
                    "title": "New data",
                    "path": "entities.value",
                    "color": "#70d8c1"
                    }
                ]
            }
        },
        "recentSearches": {
            "component": "Metrics",
            "config": {
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
            }
        },

        // TODO mock Highcharts functionality
        // "whatsNew": {
        //   "component": "New",
        //   "config": {
        //     "items": [
        //       {
        //         "label": "Today"
        //       }
        //     ]
        //   }
        // },

        "recentRecords": {
            "component": "Metrics",
            "config": {
                "thumbnail": {
                    "component": "Image",
                    "config": {
                        "path": "image"
                    }
                },
                "title": {
                    "id": "uri",
                    "path": "name"
                },
                "items": [
                    {
                        "component": "Value",
                        "config": {
                        "path": "person.phone",
                        "className": "phone"
                        }
                    }
                ],
                "categories": {
                    "arrayPath": "person.sources",
                    "path": "source.name",
                    "colors": {
                        "source1": "#c00"
                    }
                }
            }
        }
    }
}

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
        expect(getByText("Recent Searches")).toBeInTheDocument();
        expect(getByText("Recently Visited")).toBeInTheDocument();
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