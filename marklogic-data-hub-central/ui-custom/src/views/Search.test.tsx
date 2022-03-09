import Search from "./Search";
import {render, act} from "@testing-library/react";
import { UserContext } from "../store/UserContext";

const config = {
    "search": {
        "defaultEntity": "person",
        "meter": {
            "component": "SummaryMeter",
            "config": {
                "colors": {
                "all": "#cccccc",
                "filters": "#1ACCA8"
                },
                "totalRecords": 100
            }
        },
        "facets": {
            "component": "Facets",
            "config": {
                "selected": "#1acca8",
                "unselected": "#dfdfdf",
                "displayThreshold": 3,
                "displayShort": 3,
                "displayLong": 5,
                "items": [
                    {
                        "type": "category",
                        "name": "sources",
                        "tooltip": "Filter by source."
                    }
                ]
            }
        },
        "selectedFacets": {
            "component": "SelectedFacets",
            "config": {}
        },
        "results": {
            "component": "ResultsList",
            "config": {
                "thumbnail": {
                "component": "Image",
                "config": {
                    "path": "image",
                    "alt": "result thumbnail"
                }
                },
                "title": {
                "id": "uri",
                "path": "fullname"
                },
                "items": [
                {
                    "component": "Value",
                    "config": {
                    "path": "phone"
                    }
                }
                ],
                "categories": {
                "arrayPath": "extracted.person.sources",
                "path": "source.name",
                "colors": {
                    "source1": "#c00"
                }
                },
                "timestamp": {
                "path": "ts",
                "type": "datetime",
                "format": "yyyy-MM-dd"
                },
                "status": { "path": "extracted.person.status" }
            }
        }
    }
};

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
        let getByText;
        await act(async () => {
            const renderResults = render(
                <UserContext.Provider value={userContextValue}>
                    <Search />
                </UserContext.Provider>
            );
            getByText = renderResults.getByText;
        });
        expect(document.querySelector(".meter")).toBeInTheDocument();
        expect(getByText(config.search.facets.config.items[0].name)).toBeInTheDocument();
        expect(document.querySelector(".results")).toBeInTheDocument();
    });

    test("Renders loading content with empty config", async () => {
        await act(async () => {
            const renderResults = render(
                <UserContext.Provider value={userContextValueEmptyConfig}>
                    <Search />
                </UserContext.Provider>
            );
        });
        expect(document.querySelector(".loading")).toBeInTheDocument();
    });

});