import React from "react";
import {mount} from "enzyme";
import TableView from "./table-view";
import jsonDocPayload from "../../assets/mock-data/explore/json-document-payload";
import {render, cleanup} from "@testing-library/react";
import {AuthoritiesContext, AuthoritiesService} from "@util/authorities";


afterEach(() => {
  cleanup();
});
describe("Table view component", () => {
  let wrapper;
  describe("Using JSON document payload", () => {
    beforeEach(() => {
      wrapper = mount(<TableView document={jsonDocPayload.data.envelope.instance.Product} contentType="json" />);
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
      <TableView document={{}} contentType="json" />
    );
      // Check for Empty Table
    expect(getByText(/No Data/i)).toBeInTheDocument();
  });

});


describe("Unmerge record", () => {
  test("Unmerge button not available", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMatching", "readMerging"]);
    const {queryByTestId} = render(
      <AuthoritiesContext.Provider value={authorityService}>
        <TableView document={{}} contentType="json" isSidePanel={true} data={{unmerge: false}} />
      </AuthoritiesContext.Provider>
    );
    expect(queryByTestId("unmergeIcon")).toBeNull();
  });

  test("Unmerge button available and not spinner", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMatching", "readMerging"]);
    const {queryByTestId} = render(
      <AuthoritiesContext.Provider value={authorityService}>
        <TableView document={{}} contentType="json" isSidePanel={true} data={{unmerge: true}} loadingCompare="" isUnmergeAvailable={() => true}/>
      </AuthoritiesContext.Provider>
    );
    expect(queryByTestId("unmergeIcon")).toBeInTheDocument();
    expect(queryByTestId("hc-button-component-spinner")).toBeNull();
  });

  test("spinner visible", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMatching", "readMerging"]);
    const {queryByTestId} = render(
      <AuthoritiesContext.Provider value={authorityService}>
        <TableView document={{}} contentType="json" isSidePanel={true} data={{unmerge: true}} loadingCompare="abcd" isUnmergeAvailable={() => true} />
      </AuthoritiesContext.Provider>
    );
    expect(queryByTestId("hc-button-component-spinner")).toBeInTheDocument();
  });
});
