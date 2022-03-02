import List from "./List";
import {render} from "@testing-library/react";

const listConfig = [
    { 
        "component": "Value",
        "config": {
            "arrayPath": "person.email",
            "path": "value"
        }
    },
    { 
        "component": "DateTime",
        "config": {
            "path": "person.createdOn",
            "format": "yyyy-MM-dd"
        }
    }
];

const item = {
    "uri": "doc1.xml",
    "person": {
        "email": [
            { "value": "jdoe1@example.org" },
            { "value": "jdoe2@example.org" }
        ],
        "createdOn": "2020-01-01T08:00:00-07:00"
    }
};

describe("List component", () => {

    test("Verify list items appear", () => {
        const {getByText} = render(
            <List data={item} config={listConfig} />
        );
        expect(getByText(item.person.email[0].value)).toBeInTheDocument(); // Email
        expect(getByText("2020-01-01")).toBeInTheDocument(); // Datetime formatted
    });

});
