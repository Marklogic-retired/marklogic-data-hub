import React from "react";
import {fireEvent, render, waitForElement} from "@testing-library/react";
import ManageQuery from "./manage-query";
import axiosMock from "axios";

jest.mock("axios");

const getSubElements = (content, node, title) => {
  const hasText = node => node.textContent === title;
  const nodeHasText = hasText(node);
  const childrenDontHaveText = Array.from(node.children).every(
    child => !hasText(child)
  );
  return nodeHasText && childrenDontHaveText;
};

describe("Query Modal Component", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  let query = [{"savedQuery": {"id": "00529904-ed6e-4539-b7d8-eeddaf15aaa4", "name": "Lee", "description": "", "query": {"searchText": "", "entityTypeIds": ["Customer"], "selectedFacets": {"firstname": {"dataType": "xs:string", "stringValues": ["Lee"]}}}, "propertiesToDisplay": ["id"], "owner": "admin", "systemMetadata": {"createdBy": "admin", "createdDateTime": "2020-05-05T14:48:53.206721-07:00", "lastUpdatedBy": "admin", "lastUpdatedDateTime": "2020-05-05T14:48:53.206721-07:00"}}}];
  let defaultProps = {
    modalVisibility: true,
    canExportQuery: false,
    isSavedQueryUser: false,
    entityDefArray: [],
    setManageQueryModal: jest.fn()
  };

  test("Verify modal is not visible", () => {
    const {queryByTestId} = render(<ManageQuery />);
    expect(queryByTestId("manage-queries-modal")).toBeNull();
  });

  test("Verify export, edit, delete buttons are visible", async () => {
    axiosMock.get["mockImplementationOnce"](jest.fn(() => Promise.resolve({response: {status: 200, data: query}})));
    const {getByTestId} = render(<ManageQuery {...defaultProps} canExportQuery={true} isSavedQueryUser={true} />);

    expect(axiosMock).toHaveBeenCalledWith({"method": "GET", "url": "/api/entitySearch/savedQueries"});
    expect(getByTestId("manage-queries-modal")).toBeInTheDocument();

    waitForElement(() => {
      expect(getByTestId("export")).toBeInTheDocument();
      expect(getByTestId("delete")).toBeInTheDocument();
      expect(getByTestId("edit")).toBeInTheDocument();
    });
  });

  test("Verify export, edit, delete buttons are not visible", () => {
    const {queryByTestId} = render(<ManageQuery {...defaultProps} />);
    expect(queryByTestId("export")).toBeNull();
    expect(queryByTestId("delete")).toBeNull();
    expect(queryByTestId("edit")).toBeNull();
  });

  test("Verify link column does not exist", () => {
    const {queryByTestId} = render(<ManageQuery {...defaultProps} isSavedQueryUser={true} />);
    expect(queryByTestId("link")).toBeNull();
  });

  test("Verify confirmation modal message for deleting a query", async () => {
    axiosMock.get["mockImplementationOnce"](jest.fn(() => Promise.resolve({status: 200, data: query})));
    const {getByTestId, getByText} = render(<ManageQuery {...defaultProps} isSavedQueryUser={true} />);

    waitForElement(() => {
      expect(getByTestId("delete")).toBeInTheDocument();
      fireEvent.click(getByTestId("delete"));
      expect((waitForElement(() => getByText((content, node) => {
        return getSubElements(content, node, "Are you sure you would like to delete the Lee query? This action cannot be undone.");
      })))).toBeInTheDocument();
    });
  });

});
