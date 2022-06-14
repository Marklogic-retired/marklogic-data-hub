import React from "react";
import TableView from "./table-view";
import jsonDocPayload from "../../assets/mock-data/explore/json-document-payload";
import {mount} from "enzyme";
import {render} from "@testing-library/react";

describe("Table view component", () => {
  let wrapper;
  describe("Using JSON document payload", () => {
    beforeEach(() => {
      wrapper = mount(<TableView document={jsonDocPayload.data.envelope.instance.Product} contentType="json" isEntityInstance={false} location={{}} />);
    });

    test("renders", () => {
      expect(wrapper.exists()).toBe(true);
    });

    test("table view renders", () => {
      expect(wrapper.find(".react-bootstrap-table")).toHaveLength(1);
    });
  });
  // TODO add XML test cases
});

describe("Table view detail component - RTL", () => {
  test("Table detail view with No data renders", async () => {
    const {getByText} = render(
      <TableView document={{}} contentType="json" isEntityInstance={false} location={{}} />
    );
      // Check for Empty Table
    expect(getByText(/No Data/i)).toBeInTheDocument();
  });

});
