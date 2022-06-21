import DataTableMultiValue from "./DataTableMultiValue";
import { DetailContext } from "../../store/DetailContext";
import {render} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const configMultiple = {
    component: "DataTableMultiValue",
    config: {
        id: "address",
        title: "Address",
        width: 600,
        path: "result[0].extracted.person.address",
        cols: [
            {
                title: "City",
                value: "city"
            },
            {
                title: "State",
                value: "state"
            }
        ],
        metadata: [
            {
                type: "block",
                color: "#96bde4",
                value: "B"
            },
            {
                type: "block",
                color: "#5d6aaa",
                value: "4"
            }
        ]
    }
};

const configSingular = {
    component: "DataTableMultiValue",
    config: {
        id: "school",
        title: "School",
        width: 600,
        path: "result[0].extracted.person.school",
        cols: [
            {
                title: "Name",
                value: "name"
            },
            {
                title: "City",
                value: "city"
            },
            {
                title: "Year",
                value: "year"
            }
        ],
        metadata: [
            {
                type: "block",
                color: "#96bde4",
                value: "B"
            },
            {
                type: "block",
                color: "#5d6aaa",
                value: "4"
            }
        ]
    }
};

const configSingularComplex = {
    component: "DataTableMultiValue",
    config: {
        id: "school",
        title: "School",
        width: 600,
        path: "result[0].extracted.person.college",
        cols: [
            {
                title: "Name",
                value: "name.value"
            },
            {
                title: "City",
                value: "city.value"
            },
            {
                title: "Year",
                value: "year.value"
            }
        ],
        metadata: [
            {
                type: "block",
                color: "#96bde4",
                value: "B"
            },
            {
                type: "block",
                color: "#5d6aaa",
                value: "4"
            }
        ]
    }
};

const configNoExist = {
    component: "DataTableMultiValue",
    config: {
        id: "noexist", 
        title: "No Exist", 
        path: "result[0].extracted.person.noexist"
    }
};

const detail = {
	"result": [
		{
		    "extracted": {
		        "person": {
		            "id": "101",
		            "name": [ "John Doe", "Johnny Doe"],
		            "phone": ["123-456-7890", "321-654-9876"],
		            "image": ["http://example.org/entity.jpg"],
		            "address": [
                        {
                            "city": "Anytown",
                            "state": "CA"
		                },
                        {
                            "city": "Anyville",
                            "state": "CA"
		                }
                    ],
		            "school": [
                        {
                            "name": "Anytown High School",
                            "city": "Anytown",
                            "year": "2022"
                        }
                    ],
                    "college": [
                        {
                            "name": {
                                "value": "Anytown College",
                                "restricted": false
                            },
                            "city": {
                                "value": "Anytown",
                                "restricted": false
                            },
                            "year": {
                                "value": "2026",
                                "restricted": true
                            }
                        }
                    ]
		        }
		    }
		}
	]
};

const EXPANDIDS = {
    membership: true,
    info: true,
    relationships: true,
    imageGallery: true,
    timeline: true
}

const detailContextValue = {
    detail: detail,
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

describe("DataTableMultiValue component", () => {

    test("Verify data table renders with a property object with multiple values", () => {
        const {getByText, queryAllByText, getByTestId} = render(
            <DetailContext.Provider value={detailContextValue}>
                <DataTableMultiValue config={configMultiple.config} data={detail} />
            </DetailContext.Provider>
        );
        expect(getByText(configMultiple.config.title)).toBeInTheDocument();
        expect(getByTestId("hideUp")).toBeInTheDocument();
        expect(getByText("Anytown")).toBeInTheDocument();
        expect(getByText("Anyville")).toBeInTheDocument();
        expect(queryAllByText("CA").length === 2);
        userEvent.click(getByTestId("hideUp"));
        expect(getByTestId("hideDown")).toBeInTheDocument();
        userEvent.click(getByTestId("hideDown"));
        expect(getByTestId("hideUp")).toBeInTheDocument();
    });

    test("Verify data table renders with a property object with a single value", () => {
        const {getByText, queryByTestId} = render(
            <DetailContext.Provider value={detailContextValue}>
                <DataTableMultiValue config={configSingular.config} data={detail} />
            </DetailContext.Provider>
        );
        expect(getByText(configSingular.config.title)).toBeInTheDocument();
        expect(queryByTestId("hideUp")).not.toBeInTheDocument();
        expect(getByText("Anytown High School")).toBeInTheDocument();
        expect(getByText("Anytown")).toBeInTheDocument();
        expect(getByText("2022")).toBeInTheDocument();
    });

    test("Verify data table renders with a property object with nested data", () => {
        const {getByText, queryByTestId} = render(
            <DetailContext.Provider value={detailContextValue}>
                <DataTableMultiValue config={configSingularComplex.config} data={detail} />
            </DetailContext.Provider>
        );
        expect(getByText(configSingularComplex.config.title)).toBeInTheDocument();
        expect(queryByTestId("hideUp")).not.toBeInTheDocument();
        expect(getByText("Anytown College")).toBeInTheDocument();
        expect(getByText("Anytown")).toBeInTheDocument();
        expect(getByText("2026")).toBeInTheDocument();
    });

    test("Verify data table does not render with a property object that does not exist in the results", () => {
        const {queryByText, queryByTestId} = render(
            <DetailContext.Provider value={detailContextValue}>
                <DataTableMultiValue config={configNoExist.config} data={detail} />
            </DetailContext.Provider>
        );
        expect(queryByText(configNoExist.config.title)).not.toBeInTheDocument();
        expect(queryByTestId(configNoExist.config.id)).not.toBeInTheDocument();
    });

});
