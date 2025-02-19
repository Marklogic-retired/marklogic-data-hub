import React from "react";
import {fireEvent, render, waitForElement} from "@testing-library/react";
import ManageQuery from "./manage-query";
import axiosInstance from "@config/axios";
import {Router} from "react-router";
import {createMemoryHistory} from "history";
const history = createMemoryHistory();

jest.mock("@config/axios");

const getSubElements = (content, node, title) => {
  const hasText = node => node.textContent === title;
  const nodeHasText = hasText(node);
  const childrenDontHaveText = Array.from(node.children).every(child => !hasText(child));
  return nodeHasText && childrenDontHaveText;
};

describe("Query Modal Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  let query = [
    {
      "savedQuery": {
        "id": "00529904-ed6e-4539-b7d8-eeddaf15aaa4",
        "name": "Lee",
        "description": "",
        "query": {
          "searchText": "",
          "entityTypeIds": ["Customer"],
          "selectedFacets": {"firstname": {"dataType": "xs:string", "stringValues": ["Lee"]}},
        },
        "propertiesToDisplay": ["id"],
        "owner": "admin",
        "systemMetadata": {
          "createdBy": "admin",
          "createdDateTime": "2020-05-05T14:48:53.206721-07:00",
          "lastUpdatedBy": "admin",
          "lastUpdatedDateTime": "2020-05-05T14:48:53.206721-07:00",
        },
      },
    },
  ];
  let defaultProps = {
    modalVisibility: true,
    canExportQuery: false,
    isSavedQueryUser: false,
    entityDefArray: [],
    setManageQueryModal: jest.fn(),
  };

  test("Verify modal is not visible", () => {
    const {queryByTestId} = render(
      <Router history={history}>
        <ManageQuery />
      </Router>,
    );
    expect(queryByTestId("manage-queries-modal")).toBeNull();
  });

  test("Verify export, edit, delete buttons are visible", async () => {
    axiosInstance.get["mockImplementationOnce"](jest.fn(() => Promise.resolve({response: {status: 200, data: query}})));
    const {getByTestId} = render(
      <Router history={history}>
        <ManageQuery {...defaultProps} canExportQuery={true} isSavedQueryUser={true} />
      </Router>,
    );

    expect(axiosInstance).toHaveBeenCalledWith({"method": "GET", "url": "/api/entitySearch/savedQueries"});
    expect(getByTestId("manage-queries-modal")).toBeInTheDocument();

    waitForElement(() => {
      expect(getByTestId("export")).toBeInTheDocument();
      expect(getByTestId("delete")).toBeInTheDocument();
      expect(getByTestId("edit")).toBeInTheDocument();
    });
  });

  test("Verify export, edit, delete buttons are not visible", () => {
    const {queryByTestId} = render(
      <Router history={history}>
        <ManageQuery {...defaultProps} />
      </Router>,
    );
    expect(queryByTestId("export")).toBeNull();
    expect(queryByTestId("delete")).toBeNull();
    expect(queryByTestId("edit")).toBeNull();
  });

  test("Verify link column does not exist", () => {
    const {queryByTestId} = render(
      <Router history={history}>
        <ManageQuery {...defaultProps} isSavedQueryUser={true} />
      </Router>,
    );
    expect(queryByTestId("link")).toBeNull();
  });

  test("Verify confirmation modal message for deleting a query", async () => {
    axiosInstance.get["mockImplementationOnce"](jest.fn(() => Promise.resolve({status: 200, data: query})));
    const {getByTestId, getByText} = render(
      <Router history={history}>
        <ManageQuery {...defaultProps} isSavedQueryUser={true} />
      </Router>,
    );

    waitForElement(() => {
      expect(getByTestId("delete")).toBeInTheDocument();
      fireEvent.click(getByTestId("delete"));
      expect(
        waitForElement(() =>
          getByText((content, node) => {
            return getSubElements(
              content,
              node,
              "Are you sure you would like to delete the Lee query? This action cannot be undone.",
            );
          }),
        ),
      ).toBeInTheDocument();
    });
  });
});
