import React from "react";
import {render, fireEvent, screen} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import {MemoryRouter} from "react-router-dom";
import Browse from "./Browse";
import {SearchContext} from "../util/search-context";
import axiosInstance from "@config/axios";
import {exploreModelResponse} from "../../src/assets/mock-data/explore/model-response";
import {searchContextInterfaceByDefault} from "@util/uiTestCommonInterface";
import models from "../../src/assets/mock-data/explore/model-mock";

jest.mock("@config/axios");
jest.setTimeout(30000);
jest.mock("../api/modeling");
const modelsAux: any = models;

describe("Explorer Browse page tests ", () => {
  beforeEach(() => {
    axiosInstance.get["mockImplementation"](url => {
      switch (url) {
      case "/api/models":
        return Promise.resolve({status: 200, data: exploreModelResponse});
      default:
        return Promise.resolve([]);
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Verify collapsible side bar", async () => {
    const {getByLabelText} = render(
      <MemoryRouter>
        <SearchContext.Provider
          value={{
            ...searchContextInterfaceByDefault,
            setEntityDefinitionsArray: modelsAux,
          }}
        >
          <Browse />
        </SearchContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("icon-collapsed")).toBeInTheDocument();
    await fireEvent.click(getByLabelText("sider-action"));
    expect(screen.getByTestId("icon-expanded")).toBeInTheDocument();
    await fireEvent.click(getByLabelText("sider-action"));
    expect(screen.getByTestId("icon-collapsed")).toBeInTheDocument();
  });

  test("Verify snippet/table view on hover css", async () => {
    const {getByLabelText} = render(
      <MemoryRouter>
        <SearchContext.Provider
          value={{
            ...searchContextInterfaceByDefault,
            setEntityDefinitionsArray: modelsAux,
          }}
        >
          <Browse />
        </SearchContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(document.querySelector("#switch-view-table")!);
    expect(document.querySelector("#switch-view-table")).toHaveProperty("checked", true);
    expect(document.querySelector("#switch-view-snippet")).toHaveProperty("checked", false);
    fireEvent.mouseOver(document.querySelector("#switch-view-snippet")!);
    expect(getByLabelText("switch-view-snippet")).toHaveStyle("color: rgb(127, 134, 181");
    fireEvent.click(document.querySelector("#switch-view-snippet")!);
    expect(document.querySelector("#switch-view-table")).toHaveProperty("checked", false);
    expect(document.querySelector("#switch-view-snippet")).toHaveProperty("checked", true);
    fireEvent.mouseOver(document.querySelector("#switch-view-table")!);
    expect(document.querySelector("#switch-view-table")).toHaveStyle("color: rgb(127, 134, 181");
  });
});
