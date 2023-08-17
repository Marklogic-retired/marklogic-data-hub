import React from "react";
import {render, fireEvent, waitForElement} from "@testing-library/react";
import {entitySearch} from "../../assets/mock-data/explore/entity-search";
import {BrowserRouter as Router} from "react-router-dom";
import RecordCardView from "./record-view";
import axiosInstance from "axios";
import {MemoryRouter} from "react-router-dom";
import {SearchContext} from "../../util/search-context";
import testData from "../../assets/mock-data/explore/Non-entity-document-payload";
import {AuthoritiesService, AuthoritiesContext} from "../../util/authorities";
import {searchContextInterfaceByDefault} from "@util/uiTestCommonInterface";
import {SecurityTooltips} from "@config/tooltips.config";

jest.mock("@config/axios");

describe("Raw data card view component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Raw data card with data renders", async () => {
    const {getByTestId, getByText, getAllByText} = render(
      <Router>
        <RecordCardView data={entitySearch.results} />
      </Router>,
    );
    // Check raw data cards are rendered
    expect(getByTestId("/Customer/Cust1.json-URI")).toBeInTheDocument();
    expect(getByTestId("/Customer/Cust1.json-InfoIcon")).toBeInTheDocument();
    expect(getByTestId("/Customer/Cust1.json-sourceFormat")).toBeInTheDocument();
    expect(getByTestId("/Customer/Cust1.json-detailViewIcon")).toBeInTheDocument();

    expect(getByTestId("/Customer/Cust2.json-URI")).toBeInTheDocument();
    expect(getByTestId("/Customer/Cust2.json-InfoIcon")).toBeInTheDocument();
    expect(getByTestId("/Customer/Cust2.json-sourceFormat")).toBeInTheDocument();
    expect(getByTestId("/Customer/Cust2.json-detailViewIcon")).toBeInTheDocument();

    expect(getByTestId("/Customer/Cust3.json-URI")).toBeInTheDocument();
    expect(getByTestId("/Customer/Cust3.json-InfoIcon")).toBeInTheDocument();
    expect(getByTestId("/Customer/Cust3.json-sourceFormat")).toBeInTheDocument();
    expect(getByTestId("/Customer/Cust3.json-detailViewIcon")).toBeInTheDocument();

    //verify tooltips
    fireEvent.mouseOver(getByTestId("/Customer/Cust1.json-URI"));
    await waitForElement(() => getByText("/Customer/Cust1.json"));

    fireEvent.mouseOver(getByTestId("/Customer/Cust1.json-InfoIcon"));
    await waitForElement(() => getByText("View info"));

    fireEvent.mouseOver(getByTestId("/Customer/Cust1.json-detailViewIcon"));
    await waitForElement(() => getByText("View details"));

    //verify snippet content for json/xml/text docs
    expect(getByTestId("/Customer/Cust1.json-snippet").textContent).toContain(
      entitySearch.results[0].matches[0]["match-text"][0],
    );
    expect(getByTestId("/Customer.xml-snippet").textContent).toContain(
      entitySearch.results[6].matches[0]["match-text"][0],
    );
    expect(getByTestId("/Customer.txt-snippet").textContent).toContain(
      entitySearch.results[7].matches[0]["match-text"][0],
    );

    //verify snippet content for binary doc
    expect(getByTestId("/Customer/Customer.pdf-noPreview").textContent).toContain("No preview available");

    //verify popover metadata info
    fireEvent.click(getByTestId("/Customer/Cust1.json-InfoIcon"));
    expect(getByTestId("/Customer/Cust1.json-sources")).toBeInTheDocument();
    expect(getByText("loadPersonJSON")).toBeInTheDocument();
    expect(getByText("personJSON")).toBeInTheDocument();
    expect(getByText("mapPersonJSON")).toBeInTheDocument();
    expect(getByText("2020-October-09")).toBeInTheDocument();
    //verify popover metadata info for missing properties
    fireEvent.click(getByTestId("/Customer/Cust2.json-InfoIcon"));
    expect(getAllByText("none")).toHaveLength(4);
  });

  test("Verify file download", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["writeMatching", "writeMerging"]);
    axiosInstance.get = jest.fn();
    axiosInstance.get["mockImplementationOnce"](jest.fn(() => Promise.resolve(testData.allDataRecordDownloadResponse)));

    const {getByTestId, getByText} = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <SearchContext.Provider value={{...searchContextInterfaceByDefault}}>
            <RecordCardView entityDefArray={[{name: "Customer", properties: []}]} data={entitySearch.results} />
          </SearchContext.Provider>
        </AuthoritiesContext.Provider>
      </MemoryRouter>,
    );

    //verify merge icon tooltip
    fireEvent.mouseOver(getByTestId("merge-icon"));
    await waitForElement(() => getByText("Merge Documents"));

    //verify download icon
    expect(getByTestId("/Customer/Cust1.json-download-icon")).toBeInTheDocument();
    //verify download icon tooltip
    fireEvent.mouseOver(getByTestId("/Customer/Cust1.json-download-icon"));
    await waitForElement(() => getByText("Download (815 B)"));
    //click on download icon and verify api call.
    fireEvent.click(getByTestId("/Customer/Cust1.json-download-icon"));
    await (() => expect(axiosInstance.get).toHaveBeenCalledTimes(1));
  });

  test("Merge Icon not available, missing permission", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMerging", "readMatching"]);
    axiosInstance.get = jest.fn();
    axiosInstance.get["mockImplementationOnce"](jest.fn(() => Promise.resolve(testData.allDataRecordDownloadResponse)));

    const {getByTestId, getByText} = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <SearchContext.Provider value={{...searchContextInterfaceByDefault}}>
            <RecordCardView entityDefArray={[{name: "Customer", properties: []}]} data={entitySearch.results} />
          </SearchContext.Provider>
        </AuthoritiesContext.Provider>
      </MemoryRouter>,
    );

    //verify merge icon tooltip
    fireEvent.mouseOver(getByTestId("merge-icon"));
    await waitForElement(() => getByText(SecurityTooltips.missingPermissionMerge));
  });
});
