import Detail from "./Detail";
import { BrowserRouter as Router } from "react-router-dom";
import {render, act} from "@testing-library/react";
import { UserContext } from "../store/UserContext";
import { DetailContext } from "../store/DetailContext";
//import config from '../../../src/main/resources/explore-data/ui-config/config.json';

// TODO temporarily use custom config without relationships to avoid visjs graph breaking
const config = {
    "detail": {
        "heading": {
            "id": "result[0].extracted.person.personId",
            "title": { 
                "path": "result[0].extracted.person.name"
            }
        },
        "personal": {
            "items": [
                {
                    "component": "DataTableValue",
                    "config": {
                        "id": "phone",
                        "title": "Phone Number",
                        "path": "result[0].extracted.person.phone"
                    }
                }
            ]
        }
    }
}

const detail = {
	"result": [
		{
		    "extracted": {
		        "person": {
		            "id": "10001",
		            "name": [ "John Doe"],
		            "phone": ["123-456-7890"]
		        }
		    }
		}
	]
};

const detailContextValue = {
    detail: detail,
    recent: [],
    handleGetDetail: jest.fn(),
    handleGetRecentlyVisited: jest.fn(),
    handleSaveRecentlyVisited: jest.fn()
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

describe("Detail view", () => {

    test("Renders configured content with non-empty config", async () => {
        let getByText;
        await act(async () => {
            const renderResults = render(
                <Router>
                    <UserContext.Provider value={userContextValue}>
                        <DetailContext.Provider value={detailContextValue}>
                            <Detail />
                        </DetailContext.Provider>
                    </UserContext.Provider>
                </Router>
            );
            getByText = renderResults.getByText;
        });
        expect(document.querySelector(".heading")).toBeInTheDocument();
        expect(getByText(config.detail.personal.items[0].config.title)).toBeInTheDocument();
    });

    test("Renders loading content with empty config", async () => {
        await act(async () => {
            const renderResults = render(
                <Router>
                    <UserContext.Provider value={userContextValueEmptyConfig}>
                        <DetailContext.Provider value={detailContextValue}>
                            <Detail />
                        </DetailContext.Provider>
                    </UserContext.Provider>
                </Router>
            );
        });
        expect(document.querySelector(".loading")).toBeInTheDocument();
    });

});