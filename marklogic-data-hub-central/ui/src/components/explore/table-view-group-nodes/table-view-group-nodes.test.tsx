import React from "react";
import {render} from "@testing-library/react";
import axiosInstance from "@config/axios";
import TableViewGroupNodes from "./table-view-group-nodes";
import {SearchContext} from "../../../util/search-context";
import {groupNodeSearchPayload, groupNodeSearchResponse} from "../../../assets/mock-data/explore/entity-search";
import {
  searchContextInterfaceByDefault,
  defaultSearchOptions as defaultSearchOptionAux,
} from "@util/uiTestCommonInterface";

jest.mock("@config/axios");
jest.setTimeout(30000);

let defaultProps = {
  isVisible: true,
  toggleTableViewForGroupNodes: jest.fn(),
  relatedToData: {},
};

describe("Table view for group nodes modal component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("can view the table view for group nodes modal and click close", async () => {
    axiosInstance.post["mockImplementationOnce"](
      jest.fn(() => Promise.resolve({status: 200, data: groupNodeSearchResponse})),
    );
    let url = "/api/entitySearch?database=final";
    let relatedToData = {
      entityTypeId: "Product",
      predicateFilter: "http://marklogic.com/example/BabyRegistry-0.0.1/BabyRegistry/includes",
      parentNode: "http://marklogic.com/example/BabyRegistry-0.0.1/BabyRegistry/3039",
    };
    let updatedSearchOptions = {
      ...defaultSearchOptionAux,
      entityTypeIds: ["Product"],
      selectedTableProperties: ["babyRegistryId", "arrivalDate", "ownedBy", "includes"],
    };

    const {queryByText, getByLabelText, queryByLabelText, rerender} = render(
      <SearchContext.Provider value={{...searchContextInterfaceByDefault, searchOptions: updatedSearchOptions}}>
        <TableViewGroupNodes {...defaultProps} isVisible={false} />
      </SearchContext.Provider>,
    );

    expect(queryByText("Group of Product records")).toBeNull();

    //Validating that the exceeded threshold warning appears
    let relatedData = {...relatedToData, exceededThreshold: true};
    rerender(
      <SearchContext.Provider value={{...searchContextInterfaceByDefault, searchOptions: updatedSearchOptions}}>
        <TableViewGroupNodes {...defaultProps} relatedToData={relatedData} />
      </SearchContext.Provider>,
    );
    expect(queryByLabelText("exceededThresholdWarning")).toBeInTheDocument();

    //Validate other fields now (No exceed threshold warning)
    rerender(
      <SearchContext.Provider value={{...searchContextInterfaceByDefault, searchOptions: updatedSearchOptions}}>
        <TableViewGroupNodes {...defaultProps} relatedToData={relatedToData} />
      </SearchContext.Provider>,
    );

    expect(queryByLabelText("exceededThresholdWarning")).toBeNull();
    expect(queryByText("Group of Product records")).toBeInTheDocument();
    expect(getByLabelText("title-Product")).toBeInTheDocument();
    expect(getByLabelText("baseEntity-BabyRegistry")).toBeInTheDocument();
    expect(getByLabelText("baseRecordLabel-3039")).toBeInTheDocument();
    expect(axiosInstance.post).toHaveBeenCalledWith(url, groupNodeSearchPayload);
    expect(axiosInstance.post).toHaveBeenCalledTimes(1);
  });
});
