import Concat from "./Concat";
import {render} from "@testing-library/react";

const valueConfig = {
    "items": [
        {
            "path": "person.first",
            "suffix": " "
        },
        {
            "path": "person.last"
        }
    ]
};

const dateTimeConfig = {
    "items": [
        "Created by: ",
        {
            "path": "person.createdOn.user"
        },
        {
            "path": "person.createdOn.ts",
            "type": "DateTime",
            "prefix": " (",
            "suffix": ")",
        }
    ]
};

const errorConfig = {
    "items": [
        {
            "path": "noExist.first",
            "suffix": " "
        },
        {
            "path": "noExist.last"
        }
    ]
};

const items = {
    "person": {
        "first": "John",
        "last": "Doe",
        "createdOn": {
            "ts": "2011-06-17T07:26:39Z",
            "user": "jdoe"
        }
    }
};

describe("Concat component", () => {

    test("Verify Value items are concatenated", () => {
        const {getByText, getByTestId} = render(
            <Concat data={items} config={valueConfig} />
        );
        expect(getByTestId("concatId")).toBeInTheDocument();
        expect(getByText(items.person.first + " " + items.person.last)).toBeInTheDocument();
    });

    test("Verify DateTime item is concatenated", () => {
        const {getByText, getByTestId} = render(
            <Concat data={items} config={dateTimeConfig} />
        );
        expect(getByTestId("concatId")).toBeInTheDocument();
        expect(getByText("Created by: jdoe (2011-06-17)")).toBeInTheDocument();
    });

    test("Verify config with error is handled", () => {
        const {getByTestId} = render(
            <Concat data={items} config={errorConfig} />
        );
        expect(getByTestId("concatId")).toBeInTheDocument();
    });

});
