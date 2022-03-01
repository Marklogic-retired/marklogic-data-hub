import DataTableValue from "./DataTableValue";
import { DetailContext } from "../../store/DetailContext";
import {render} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const configMultiple = {
    component: "DataTableValue",
    config: {
        id: "phone", 
        title: "Phone Number", 
        path: "result[0].extracted.person.phone", 
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
    }
};

const configSingular = {
    component: "DataTableValue",
    config: {
        id: "ssn", 
        title: "SSN", 
        path: "result[0].extracted.person.ssn",
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

const configArrayPathMultiple = {
    component: "DataTableValue",
    config: {
        id: "email", 
        title: "Email", 
        arrayPath: "result[0].extracted.person.email",
        path: "value",
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

const configArrayPathSingular = {
    component: "DataTableValue",
    config: {
        id: "email", 
        title: "Email", 
        arrayPath: "result[0].extracted.person.image",
        path: "value",
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
    component: "DataTableValue",
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
                    "email": [
                        {
                            "value": "jdoe1@example.org",
                            "restricted": false
                        }, 
                        {
                            "value": "jdoe2@example.org",
                            "restricted": true
                        }
                    ],
                    "image": {
                        "value": "http://example.org/entity1.jpg",
                        "restricted": false
                    },
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
            <DataTableValue config={configMultiple.config} data={detail} />
        );
        expect(getByText(configMultiple.config.title)).toBeInTheDocument();
        expect(getByTestId("hideUp")).toBeInTheDocument();
        expect(getByTestId("icon-" + configMultiple.config.icon)).toBeInTheDocument();
        expect(getByText("123-456-7890")).toBeInTheDocument();
        expect(getByText("321-654-9876")).toBeInTheDocument();
        expect(queryAllByText(configMultiple.config.metadata[0].value).length > 0);
        expect(queryAllByText(configMultiple.config.metadata[1].value).length > 0);
        userEvent.click(getByTestId("hideUp"));
        expect(getByTestId("hideDown")).toBeInTheDocument();
        userEvent.click(getByTestId("hideDown"));
        expect(getByTestId("hideUp")).toBeInTheDocument();
    });

    test("Verify data table renders with a property with a single value", () => {
        const {getByText, queryAllByText, queryByTestId} = render(
            <DetailContext.Provider value={detailContextValue}>
                <DataTableValue config={configSingular.config} data={detail} />
            </DetailContext.Provider>
        );
        expect(getByText(configSingular.config.title)).toBeInTheDocument();
        expect(queryByTestId("hideUp")).not.toBeInTheDocument();
        expect(getByText("123-45-6789")).toBeInTheDocument();
        expect(queryAllByText(configMultiple.config.metadata[0].value).length > 0);
        expect(queryAllByText(configMultiple.config.metadata[1].value).length > 0);
    });

    test("Verify data table renders with a property in an array of objects using arrayPath", () => {
        const {getByText, getByTestId} = render(
            <DetailContext.Provider value={detailContextValue}>
                <DataTableValue config={configArrayPathMultiple.config} data={detail} />
            </DetailContext.Provider>
        );
        expect(getByText(configArrayPathMultiple.config.title)).toBeInTheDocument();
        expect(getByTestId("hideUp")).toBeInTheDocument();
        expect(getByText("jdoe1@example.org")).toBeInTheDocument();
        expect(getByText("jdoe2@example.org")).toBeInTheDocument();
    });

    test("Verify data table renders with a property in a single object using arrayPath", () => {
        const {getByText, queryByTestId} = render(
            <DetailContext.Provider value={detailContextValue}>
                <DataTableValue config={configArrayPathSingular.config} data={detail} />
            </DetailContext.Provider>
        );
        expect(getByText(configArrayPathSingular.config.title)).toBeInTheDocument();
        expect(queryByTestId("hideUp")).not.toBeInTheDocument();
        expect(getByText("http://example.org/entity1.jpg")).toBeInTheDocument();
    });

    test("Verify data table does not render with a property that does not exist in the results", () => {
        const {queryByText, queryByTestId} = render(
            <DetailContext.Provider value={detailContextValue}>
                <DataTableValue config={configNoExist.config} data={detail} />
            </DetailContext.Provider>
        );
        expect(queryByText(configNoExist.config.title)).not.toBeInTheDocument();
        expect(queryByTestId(configNoExist.config.id)).not.toBeInTheDocument();
    });

});
