import React from "react";
import {render, fireEvent, wait} from "@testing-library/react";
import PopOverSearch from "./pop-over-search";
import axiosMock from "axios";
import {stringSearchResponse} from "../../assets/mock-data/explore/facet-props";
jest.mock("axios");
import {MemoryRouter} from "react-router-dom";
import {SearchContext} from "../../util/search-context";


describe("<PopOverSearch/>", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Popover component renders without crashing, has an input field and a checked icon", async () => {
    axiosMock.post["mockImplementationOnce"](jest.fn(() => Promise.resolve({status: 200, data: stringSearchResponse})));
    const {getByText, getByPlaceholderText, getByLabelText} = render(
      <MemoryRouter>
        <SearchContext.Provider value={{
          searchOptions: {tileId: "explore",
            database: "final"}
        }}>
          <PopOverSearch
            referenceType={"path"}
            entityTypeId={"http://example.org/Customer-0.0.1/Customer"}
            propertyPath={"name"}
            checkFacetValues={jest.fn()}
            popOvercheckedValues={[]}
            facetValues= {[]}
            facetName={""}
            database="final"
          />);
        </SearchContext.Provider></MemoryRouter>);

    fireEvent.click(getByText("See all"));
    let inputField = getByPlaceholderText("Search");
    await wait(() => {
      fireEvent.change(inputField, {target: {value: "ad"}});
    });
    let url = "/api/entitySearch/facet-values?database=final";
    let payload = {
      "referenceType": "path",
      "entityTypeId": "http://example.org/Customer-0.0.1/Customer",
      "propertyPath": "name",
      "limit": 10,
      "dataType": "string",
      "pattern": "ad"
    };
    expect(axiosMock.post).toHaveBeenCalledWith(url, payload);
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(getByText("Adams Cole")).toBeInTheDocument();
    expect(getByLabelText("icon: check-square-o")).toBeInTheDocument();
  });

  test("Popover component renders without crashing, has an input field and a checked icon on monitor tile", async () => {
    axiosMock.post["mockImplementationOnce"](jest.fn(() => Promise.resolve({status: 200, data: stringSearchResponse})));
    const {getByText, getByPlaceholderText, getByLabelText} = render(
      <MemoryRouter>
        <SearchContext.Provider value={{
          searchOptions: {tileId: "monitor"}
        }}>
          <PopOverSearch
            referenceType={""}
            entityTypeId={""}
            propertyPath={""}
            checkFacetValues={jest.fn()}
            popOvercheckedValues={[]}
            facetValues= {[]}
            facetName={"stepName"}
          />);
        </SearchContext.Provider></MemoryRouter>);

    fireEvent.click(getByText("See all"));
    let inputField = getByPlaceholderText("Search");
    await wait(() => {
      fireEvent.change(inputField, {target: {value: "ad"}});
    });
    let url = "/api/jobs/stepResponses/facetValues";
    let payload = {
      "facetName": "stepName",
      "searchTerm": "ad"
    };
    expect(axiosMock.post).toHaveBeenCalledWith(url, payload);
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(getByText("Adams Cole")).toBeInTheDocument();
    expect(getByLabelText("icon: check-square-o")).toBeInTheDocument();
  });


});


