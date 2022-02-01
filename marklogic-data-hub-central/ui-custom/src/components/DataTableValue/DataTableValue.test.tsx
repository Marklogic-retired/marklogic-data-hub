import DataTableValue from "./DataTableValue";
import { DetailContext } from "../../store/DetailContext";
import {render} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const configMultiple = {
    id: "phone", 
    title: "Phone Number", 
    dataPath: "result[0].extracted.person.phone", 
    icon: "phone",
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
    id: "ssn", 
    title: "SSN", 
    dataPath: "result[0].extracted.person.ssn",
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
		            "status": ["active"],
		            "ssn": ["123-45-6789"],
		            "sources": ["source1", "source2"],
		            "createdOn": ["2020-01-01T08:00:00-07:00"]
		        }
		    }
		}
	]
};

const detailContextValue = {
    detail: detail,
    handleDetail: jest.fn()
};

describe("DataTableValue component", () => {

    test("Verify data table renders with a property with multiple values and an icon", () => {
        const {getByText, queryAllByText, getByTestId} = render(
            <DetailContext.Provider value={detailContextValue}>
                <DataTableValue config={configMultiple} />
            </DetailContext.Provider>
        );
        expect(getByText(configMultiple.title)).toBeInTheDocument();
        expect(getByTestId("hideUp")).toBeInTheDocument();
        expect(getByTestId("icon-" + configMultiple.icon)).toBeInTheDocument();
        expect(getByText("123-456-7890")).toBeInTheDocument();
        expect(getByText("321-654-9876")).toBeInTheDocument();
        expect(queryAllByText(configMultiple.metadata[0].value).length > 0);
        expect(queryAllByText(configMultiple.metadata[1].value).length > 0);
        userEvent.click(getByTestId("hideUp"));
        expect(getByTestId("hideDown")).toBeInTheDocument();
        userEvent.click(getByTestId("hideDown"));
        expect(getByTestId("hideUp")).toBeInTheDocument();
    });

    test("Verify data table renders with a property with a single value", () => {
        const {getByText, queryAllByText, queryByTestId} = render(
            <DetailContext.Provider value={detailContextValue}>
                <DataTableValue config={configSingular} />
            </DetailContext.Provider>
        );
        expect(getByText(configSingular.title)).toBeInTheDocument();
        expect(queryByTestId("hideUp")).not.toBeInTheDocument();
        expect(getByText("123-45-6789")).toBeInTheDocument();
        expect(queryAllByText(configMultiple.metadata[0].value).length > 0);
        expect(queryAllByText(configMultiple.metadata[1].value).length > 0);
    });

    test("Verify data table does not render with a property that does not exist in the results", () => {
        const {queryByText, queryByTestId} = render(
            <DetailContext.Provider value={detailContextValue}>
                <DataTableValue config={configNoExist} />
            </DetailContext.Provider>
        );
        expect(queryByText(configNoExist.title)).not.toBeInTheDocument();
        expect(queryByTestId(configNoExist.id)).not.toBeInTheDocument();
    });

});
