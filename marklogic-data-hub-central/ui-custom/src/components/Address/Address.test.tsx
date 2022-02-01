import Address from "./Address";
import {render} from "@testing-library/react";

const config = { 
    street1: "address.street1",
    street2: "address.street2",
    city: "address.city",
    state: "address.state",
    postal1: "address.postal1",
    postal2: "address.postal2"
};

const data = { 
    address: {
        street1: "123 Main St.",
        street2: "Apt. 456",
        city: "Anytown",
        state: "CA",
        postal1: "12345",
        postal2: "6789"
    }
};

const data2 = { 
    address: {
        street1: "123 Main St.",
        city: "Anytown",
        state: "CA",
        postal1: "12345"
    }
};

// If multiple addresses returned, addressPath points to array
const configArray = { 
    addressPath: "address",
    street1: "street1",
    street2: "street2",
    city: "city",
    state: "state",
    postal1: "postal1",
    postal2: "postal2"
};

const dataArray = { 
    address: [
        data.address,
        data2.address
    ]
};

describe("Address component", () => {

    test("Verify address is rendered", () => {
        const {getByText} = render(<Address config={config} data={data} />);
        expect(getByText(data.address.street1 + ", " + data.address.street2 + 
            ", " + data.address.city + ", " + data.address.state + " " + 
            data.address.postal1 + "-" + data.address.postal2)).toBeInTheDocument();
    });

    test("Verify incomplete address is rendered", () => {
        const {getByText} = render(<Address config={config} data={data2} />);
        expect(getByText(data.address.street1 + ", " + data.address.city + ", " 
            + data.address.state + " " + data.address.postal1)).toBeInTheDocument();
    });

    test("Verify first address is rendered for address array", () => {
        const {getByText} = render(<Address config={configArray} data={dataArray} />);
        expect(getByText(data.address.street1 + ", " + data.address.street2 + 
            ", " + data.address.city + ", " + data.address.state + " " + 
            data.address.postal1 + "-" + data.address.postal2)).toBeInTheDocument();
    });

});
