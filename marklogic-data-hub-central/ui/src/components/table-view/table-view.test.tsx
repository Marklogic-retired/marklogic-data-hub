import React from "react";
import {act} from "react-dom/test-utils";
import TableView from "./table-view";
import jsonDocPayload from "../../assets/mock-data/explore/json-document-payload";
import {render} from "@testing-library/react";
import {AuthoritiesContext, AuthoritiesService} from "@util/authorities";

describe("Table view component",  () => {
  test("renders", async() => {
    let infoRender:any;
    await act(async () => {
      infoRender = render(<TableView document={jsonDocPayload.data.envelope.instance.Product} contentType="json"  location= {""} isEntityInstance={ true}/>);
    });
    expect(infoRender.container.getElementsByClassName("react-bootstrap-table")).toHaveLength(1);
  });
});

describe("Table view detail component - RTL", () => {
  test("Table detail view with No data renders", async () => {
    const {getByText} = render(
      <TableView document={{}} contentType="json" location={""} isEntityInstance={false} isSidePanel={false}/>
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
        <TableView document={{}} contentType="json" isSidePanel={true} data={{unmerge: false}} location={""} isEntityInstance={false} />
      </AuthoritiesContext.Provider>
    );
    expect(queryByTestId("unmergeIcon")).toBeNull();
  });

  test("Unmerge button available and not spinner", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMatching", "readMerging"]);
    const {queryByTestId} = render(
      <AuthoritiesContext.Provider value={authorityService}>
        <TableView document={{}} contentType="json" isSidePanel={true} data={{unmerge: true}} loadingCompare="" isUnmergeAvailable={() => true} location={""} isEntityInstance={false}/>
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
        <TableView document={{}} contentType="json" isSidePanel={true} data={{unmerge: true}} loadingCompare="abcd" isUnmergeAvailable={() => true} location={""} isEntityInstance={false} />
      </AuthoritiesContext.Provider>
    );
    expect(queryByTestId("hc-button-component-spinner")).toBeInTheDocument();
  });
});