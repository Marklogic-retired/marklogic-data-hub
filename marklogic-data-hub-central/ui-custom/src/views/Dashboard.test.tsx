import Dashboard from "./Dashboard";
import {render, act} from "@testing-library/react";
import { UserContext } from "../store/UserContext";
import userEvent from "@testing-library/user-event";
import ConfirmationModal from "../components/ConfirmationModal/ConfirmationModal";

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
        let getByText, getByTestId, rerender;
        const toggleModal = jest.fn();
        const confirmAction = jest.fn();
        await act(async () => {
            const renderResults = render(
                <UserContext.Provider value={userContextValue}>
                    <Dashboard />
                </UserContext.Provider>
            );
            getByText = renderResults.getByText;
            getByTestId = renderResults.getByTestId;
            rerender = renderResults.rerender;
        });
        expect(getByText("Recent Searches")).toBeInTheDocument();
        //To test clear button over recently search record section
        expect(getByTestId("recentSearches-clearButton")).toBeInTheDocument();
        userEvent.click(getByTestId("recentSearches-clearButton"));

        expect(getByText("Recently Visited")).toBeInTheDocument();
        //To test clear button over recently visited record section
        expect(getByTestId("recentRecords-clearButton")).toBeInTheDocument();
        userEvent.click(getByTestId("recentRecords-clearButton"));
        rerender(<ConfirmationModal
            isVisible={true}
            bodyContent={"Test"}
            headerContent={""}
            toggleModal={toggleModal}
            confirmAction={confirmAction}
            title={"record"}
        />);
        //To test that confirmation modal opens on clicking clear button
        expect(getByTestId("record-resetConfirmationModal")).toBeInTheDocument();
        expect(getByTestId("noButton")).toBeInTheDocument();
        expect(getByTestId("yesButton")).toBeInTheDocument();
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