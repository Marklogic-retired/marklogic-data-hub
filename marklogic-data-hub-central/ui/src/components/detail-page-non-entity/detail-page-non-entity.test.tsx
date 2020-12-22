import React from "react";
import {render, fireEvent} from "@testing-library/react";
import {BrowserRouter as Router} from "react-router-dom";
import DetailPageNonEntity from "./detail-page-non-entity";
import testData from "../../assets/mock-data/explore/Non-entity-document-payload";
import userEvent from "@testing-library/user-event";
import axiosMock from "axios";

jest.mock("axios");

describe("Detail page for non-entity view component", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Detail page for non-entity with JSON data renders", () => {
    const {getByTestId, getByText, queryByTestId} = render(
      <Router>
        <DetailPageNonEntity
          {...testData.NonEntityDocumentData}
        />
      </Router>
    );

    //Check URI
    expect(getByTestId("non-entity-document-uri")).toBeInTheDocument();

    //Check Sources table data
    expect(getByTestId("non-entity-sources-label")).toBeInTheDocument();
    expect(getByText("testSourceForCustomer")).toBeInTheDocument();
    expect(getByText("testSourceType")).toBeInTheDocument();

    //Check history table data
    expect(getByTestId("non-entity-history-label")).toBeInTheDocument();
    expect(getByText("2020-08-10 12:00")).toBeInTheDocument();
    expect(getByText("mapCustomerStep")).toBeInTheDocument();
    expect(getByText("mergeCustomer")).toBeInTheDocument();
    expect(getByText("loadCustomer")).toBeInTheDocument();

    //Check document record data
    expect(getByTestId("record-view")).toBeInTheDocument();
    expect(getByTestId("json-container")).toHaveTextContent(/(?=.*customerId)(?=.*1001)(?=.*firstName)(?=.*Gabriel)(?=.*lastName)(?=.*324 Wilkinson blvd)/i);

    //Check siderExpandCollapse Icons
    expect(getByTestId("metadataIcon-expanded")).toBeInTheDocument();
    expect(getByTestId("sider-nonEntityDetailPage")).toHaveStyle("width: 45vw;"); // non-zero width represents the expanded sider
    expect(queryByTestId("metadataIcon-collapsed")).not.toBeInTheDocument();

    userEvent.click(getByTestId("metadataIcon-expanded"));
    expect(getByTestId("metadataIcon-collapsed")).toBeInTheDocument();
    expect(getByTestId("sider-nonEntityDetailPage")).toHaveStyle("width: 0px;"); // 0 width represents the collapsed sider

  });

  test("Detail page for non-entity with XML data renders", () => {
    const {getByTestId, getByText, queryByTestId} = render(
      <Router>
        <DetailPageNonEntity
          {...testData.NonEntityDocumentData}
          contentType={"xml"}
          data={testData.xmlData}
          xml={testData.xmlInput}
        />
      </Router>
    );

    //Check URI
    expect(getByTestId("non-entity-document-uri")).toBeInTheDocument();

    //Check Sources table data
    expect(getByTestId("non-entity-sources-label")).toBeInTheDocument();
    expect(getByText("testSourceForCustomer")).toBeInTheDocument();
    expect(getByText("testSourceType")).toBeInTheDocument();

    //Check history table data
    expect(getByTestId("non-entity-history-label")).toBeInTheDocument();
    expect(getByText("2020-08-10 12:00")).toBeInTheDocument();
    expect(getByText("mapCustomerStep")).toBeInTheDocument();
    expect(getByText("mergeCustomer")).toBeInTheDocument();
    expect(getByText("loadCustomer")).toBeInTheDocument();

    //Check XML document record data
    expect(getByTestId("record-view")).toBeInTheDocument();
    expect(getByTestId("xml-container")).toHaveTextContent(/(?=.*word)(?=.*Alexandra)(?=.*Alice)(?=.*Barbara)(?=.*Bob)/i);

    //Check siderExpandCollapse Icons
    expect(getByTestId("metadataIcon-expanded")).toBeInTheDocument();
    expect(getByTestId("sider-nonEntityDetailPage")).toHaveStyle("width: 45vw;"); // non-zero width represents the expanded sider
    expect(queryByTestId("metadataIcon-collapsed")).not.toBeInTheDocument();

    userEvent.click(getByTestId("metadataIcon-expanded"));
    expect(getByTestId("metadataIcon-collapsed")).toBeInTheDocument();
    expect(getByTestId("sider-nonEntityDetailPage")).toHaveStyle("width: 0px;"); // 0 width represents the collapsed sider

  });

  test("Detail page for non-entity with Text data renders", () => {
    const {getByTestId, getByText, queryByTestId, queryByText} = render(
      <Router>
        <DetailPageNonEntity
          {...testData.NonEntityDocumentData}
          contentType={"text"}
          data={testData.textData}
        />
      </Router>
    );

    //Check URI
    expect(getByTestId("non-entity-document-uri")).toBeInTheDocument();

    //Check Sources table data
    expect(getByTestId("non-entity-sources-label")).toBeInTheDocument();
    expect(getByText("testSourceForCustomer")).toBeInTheDocument();
    expect(getByText("testSourceType")).toBeInTheDocument();

    //Check history table data
    expect(getByTestId("non-entity-history-label")).toBeInTheDocument();
    expect(getByText("2020-08-10 12:00")).toBeInTheDocument();
    expect(getByText("mapCustomerStep")).toBeInTheDocument();
    expect(getByText("mergeCustomer")).toBeInTheDocument();
    expect(getByText("loadCustomer")).toBeInTheDocument();

    //Check only Record header displys for the text document.
    expect(getByText("Record")).toBeInTheDocument();
    expect(queryByText("Instance")).toBeNull();

    //Check TEXT document record data
    expect(getByTestId("text-container")).toHaveTextContent("customerId 1001 firstName Gabriel lastName Stane Gender Male years_active 3 Street 324 Wilkinson blvd Apt 108 City Long Beach State CA zipCode 95034");

    //Check siderExpandCollapse Icons
    expect(getByTestId("metadataIcon-expanded")).toBeInTheDocument();
    expect(getByTestId("sider-nonEntityDetailPage")).toHaveStyle("width: 45vw;"); // non-zero width represents the expanded sider
    expect(queryByTestId("metadataIcon-collapsed")).not.toBeInTheDocument();

    userEvent.click(getByTestId("metadataIcon-expanded"));
    expect(getByTestId("metadataIcon-collapsed")).toBeInTheDocument();
    expect(getByTestId("sider-nonEntityDetailPage")).toHaveStyle("width: 0px;"); // 0 width represents the collapsed sider

  });


  test("Verify file download on Detail page", async () => {
    axiosMock.get["mockImplementationOnce"](jest.fn(() => Promise.resolve(testData.detailRecordDownloadResponse)));

    const {getByTestId} = render(
      <Router>
        <DetailPageNonEntity
          {...testData.NonEntityDocumentData}
        />
      </Router>
    );

    //verify download icon
    expect(getByTestId("download-link")).toBeInTheDocument();
    //click on download icon and verify api call.
    fireEvent.click(getByTestId("download-link"));
    expect(axiosMock).toHaveBeenCalledWith({"method": "GET", "responseType": "blob", "url": "/api/record/download?docUri=%2FloadCustomers.json&database=staging"});
  });
});
