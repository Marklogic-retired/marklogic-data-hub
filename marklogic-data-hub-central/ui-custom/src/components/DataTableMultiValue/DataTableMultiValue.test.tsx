import DataTableMultiValue from "./DataTableMultiValue";
import { DetailContext } from "../../store/DetailContext";
import {render} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const configMultiple = {
    id: "address",
    title: "Address",
    width: 600,
    dataPath: "result[0].extracted.person.address",
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
};

const configSingular = {
    id: "school",
    title: "School",
    width: 600,
    dataPath: "result[0].extracted.person.school",
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
};

const configNoExist = {
    id: "noexist", 
    title: "No Exist", 
    dataPath: "result[0].extracted.person.noexist",
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
                    ]
		        }
		    }
		}
	]
};

const detailContextValue = {
    detail: detail,
    handleDetail: jest.fn()
};

describe("DataTableMultiValue component", () => {

    test("Verify data table renders with a property object with multiple values", () => {
        const {getByText, queryAllByText, getByTestId} = render(
            <DetailContext.Provider value={detailContextValue}>
                <DataTableMultiValue config={configMultiple} />
            </DetailContext.Provider>
        );
        expect(getByText(configMultiple.title)).toBeInTheDocument();
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
                <DataTableMultiValue config={configSingular} />
            </DetailContext.Provider>
        );
        expect(getByText(configSingular.title)).toBeInTheDocument();
        expect(queryByTestId("hideUp")).not.toBeInTheDocument();
        expect(getByText("Anytown High School")).toBeInTheDocument();
        expect(getByText("Anytown")).toBeInTheDocument();
        expect(getByText("2022")).toBeInTheDocument();
    });

    test("Verify data table does not render with a property object that does not exist in the results", () => {
        const {queryByText, queryByTestId} = render(
            <DetailContext.Provider value={detailContextValue}>
                <DataTableMultiValue config={configNoExist} />
            </DetailContext.Provider>
        );
        expect(queryByText(configNoExist.title)).not.toBeInTheDocument();
        expect(queryByTestId(configNoExist.id)).not.toBeInTheDocument();
    });

});
