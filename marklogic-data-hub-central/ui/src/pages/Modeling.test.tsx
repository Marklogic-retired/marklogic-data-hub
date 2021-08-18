import React from "react";
import {render, wait, screen, fireEvent} from "@testing-library/react";
import {waitFor} from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import {BrowserRouter as Router} from "react-router-dom";

import Modeling from "./Modeling";
import {AuthoritiesContext} from "../util/authorities";
import authorities from "../assets/mock-data/authorities.testutils";
import {ModelingContext} from "../util/modeling-context";
import {ModelingTooltips} from "../config/tooltips.config";
import {getEntityTypes} from "../assets/mock-data/modeling/modeling";
import {isModified, notModified, isModifiedTableView, notModifiedTableView} from "../assets/mock-data/modeling/modeling-context-mock";
import {primaryEntityTypes, publishDraftModels, updateEntityModels} from "../api/modeling";
import {ConfirmationType} from "../types/common-types";
import tiles from "../config/tiles.config";
import {getViewSettings} from "../util/user-context";
import {act} from "react-dom/test-utils";
import "jest-canvas-mock";

jest.mock("../api/modeling");

const mockPrimaryEntityType = primaryEntityTypes as jest.Mock;
const mockUpdateEntityModels = updateEntityModels as jest.Mock;
const mockPublishDraftModels = publishDraftModels as jest.Mock;

const mockDevRolesService = authorities.DeveloperRolesService;
const mockOpRolesService = authorities.OperatorRolesService;
const mockHCUserRolesService = authorities.HCUserRolesService;

const renderView = (view) => {
  let contextValue = view === "table" ? isModifiedTableView : isModified;
  return (
    <AuthoritiesContext.Provider value={mockDevRolesService}>
      <ModelingContext.Provider value={contextValue}>
        <Router>
          <Modeling/>
        </Router>
      </ModelingContext.Provider>
    </AuthoritiesContext.Provider>
  );
};

describe("Modeling Page", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Modeling: with mock data, renders modified Alert component and Dev role can click add, edit, and publish", async () => {
    mockPrimaryEntityType.mockResolvedValueOnce({status: 200, data: getEntityTypes});
    mockUpdateEntityModels.mockResolvedValueOnce({status: 200});
    mockPublishDraftModels.mockResolvedValueOnce({status: 200});

    let getByText, getByLabelText;
    await act(async () => {
      const renderResults = render(
        <AuthoritiesContext.Provider value={mockDevRolesService}>
          <ModelingContext.Provider value={isModifiedTableView}>
            <Router>
              <Modeling/>
            </Router>
          </ModelingContext.Provider>
        </AuthoritiesContext.Provider>
      );
      getByText = renderResults.getByText;
      getByLabelText = renderResults.getByLabelText;
    });

    await wait(() => expect(mockPrimaryEntityType).toHaveBeenCalledTimes(2));

    expect(getByText(tiles.model.intro)).toBeInTheDocument(); // tile intro text

    expect(getByText("Entity Types")).toBeInTheDocument();
    expect(getByLabelText("add-entity")).toBeInTheDocument();
    expect(getByText("Instances")).toBeInTheDocument();
    expect(getByText("Last Processed")).toBeInTheDocument();
    expect(getByLabelText("entity-modified-alert")).toBeInTheDocument();

    // test add, publish icons display correct tooltip when enabled
    fireEvent.mouseOver(getByText("Add"));
    await wait(() => expect(getByText(ModelingTooltips.addNewEntity)).toBeInTheDocument());
    fireEvent.mouseOver(getByLabelText("publish-to-database"));
    await wait(() => expect(getByText(ModelingTooltips.publish)).toBeInTheDocument());

    userEvent.click(screen.getByTestId("AnotherModel-span"));
    expect(screen.getByText("Edit Entity Type")).toBeInTheDocument();

    userEvent.click(getByText("Add"));
    expect(getByText(/Add Entity Type/i)).toBeInTheDocument();

    userEvent.click(getByLabelText("publish-to-database"));
    userEvent.click(screen.getByLabelText(`confirm-${ConfirmationType.PublishAll}-yes`));
    expect(mockPublishDraftModels).toHaveBeenCalledTimes(1);

    // userEvent.click(getByText("Revert All"));
    // userEvent.click(screen.getByLabelText(`confirm-${ConfirmationType.RevertAll}-yes`));
    // expect(mockPrimaryEntityType).toHaveBeenCalledTimes(2);
  });

  test("Modeling: with mock data, no Alert component renders and operator role can not click add", async () => {
    mockPrimaryEntityType.mockResolvedValueOnce({status: 200, data: getEntityTypes});

    let getByText, getByLabelText, queryByLabelText;
    await act(async () => {
      const renderResults = render(
        <AuthoritiesContext.Provider value={mockOpRolesService}>
          <ModelingContext.Provider value={notModifiedTableView}>
            <Router>
              <Modeling/>
            </Router>
          </ModelingContext.Provider>
        </AuthoritiesContext.Provider>
      );
      getByText = renderResults.getByText;
      getByLabelText = renderResults.getByLabelText;
      queryByLabelText = renderResults.queryByLabelText;
    });

    await wait(() => expect(mockPrimaryEntityType).toHaveBeenCalledTimes(2));

    expect(getByText("Entity Types")).toBeInTheDocument();
    expect(getByText("Instances")).toBeInTheDocument();
    expect(getByText("Last Processed")).toBeInTheDocument();

    expect(getByLabelText("add-entity")).toBeDisabled();

    // test add, save, revert icons display correct tooltip when disabled
    fireEvent.mouseOver(getByText("Add"));
    await wait(() => expect(getByText(ModelingTooltips.addNewEntity + " " + ModelingTooltips.noWriteAccess)).toBeInTheDocument());
    fireEvent.mouseOver(getByText("Publish"));
    await wait(() => expect(getByText(ModelingTooltips.publish + " " + ModelingTooltips.noWriteAccess)).toBeInTheDocument());
    expect(queryByLabelText("entity-modified-alert")).toBeNull();
  });

  test("Modeling: can not see data if user does not have entity model reader role", async () => {
    mockPrimaryEntityType.mockResolvedValueOnce({status: 200, data: getEntityTypes});

    const {queryByText, queryByLabelText} = render(
      <AuthoritiesContext.Provider value={mockHCUserRolesService}>
        <ModelingContext.Provider value={notModified}>
          <Router>
            <Modeling/>
          </Router>
        </ModelingContext.Provider>
      </AuthoritiesContext.Provider>
    );

    await wait(() => expect(mockPrimaryEntityType).toHaveBeenCalledTimes(0));
    expect(queryByText("Entity Types")).toBeNull();
    expect(queryByText("Instances")).toBeNull();
    expect(queryByText("Last Processed")).toBeNull();

    expect(queryByLabelText("add-entity")).toBeNull();
    expect(queryByLabelText("publish-to-database")).toBeNull();
    expect(queryByLabelText("entity-modified-alert")).toBeNull();
  });
});

describe("getViewSettings", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    jest.restoreAllMocks();
  });

  const sessionStorageMock = (() => {
    let store = {};

    return {
      getItem(key) {
        return store[key] || null;
      },
      setItem(key, value) {
        store[key] = value.toString();
      },
      removeItem(key) {
        delete store[key];
      },
      clear() {
        store = {};
      }
    };
  })();

  Object.defineProperty(window, "sessionStorage", {
    value: sessionStorageMock
  });

  it("should get entity expanded rows from session storage", () => {
    const getItemSpy = jest.spyOn(window.sessionStorage, "getItem");
    window.sessionStorage.setItem("dataHubViewSettings", JSON.stringify({model: {entityExpandedRows: ["Customer,"]}}));
    const actualValue = getViewSettings();
    expect(actualValue).toEqual({model: {entityExpandedRows: ["Customer,"]}});
    expect(getItemSpy).toBeCalledWith("dataHubViewSettings");
  });

  it("should get property expanded rows from session storage", () => {
    const getItemSpy = jest.spyOn(window.sessionStorage, "getItem");
    window.sessionStorage.setItem("dataHubViewSettings", JSON.stringify({model: {propertyExpandedRows: ["shipping,31"]}}));
    const actualValue = getViewSettings();
    expect(actualValue).toEqual({model: {propertyExpandedRows: ["shipping,31"]}});
    expect(getItemSpy).toBeCalledWith("dataHubViewSettings");
  });

  it("should get entity and property expanded rows from session storage", () => {
    const getItemSpy = jest.spyOn(window.sessionStorage, "getItem");
    window.sessionStorage.setItem("dataHubViewSettings", JSON.stringify({model: {entityExpandedRows: ["Customer,"], propertyExpandedRows: ["shipping,31"]}}));
    const actualValue = getViewSettings();
    expect(actualValue).toEqual({model: {entityExpandedRows: ["Customer,"], propertyExpandedRows: ["shipping,31"]}});
    expect(getItemSpy).toBeCalledWith("dataHubViewSettings");
  });

  it("should get empty object if no info in session storage", () => {
    const getItemSpy = jest.spyOn(window.sessionStorage, "getItem");
    const actualValue = getViewSettings();
    expect(actualValue).toEqual({});
    expect(window.sessionStorage.getItem).toBeCalledWith("dataHubViewSettings");
    expect(getItemSpy).toBeCalledWith("dataHubViewSettings");
  });
});


describe("Graph view page", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Modeling: graph view renders properly", async () => {
    mockPrimaryEntityType.mockResolvedValueOnce({status: 200, data: getEntityTypes});
    mockUpdateEntityModels.mockResolvedValueOnce({status: 200});

    const {getByText, getByLabelText} = render(
      <AuthoritiesContext.Provider value={mockDevRolesService}>
        <ModelingContext.Provider value={isModified}>
          <Router>
            <Modeling/>
          </Router>
        </ModelingContext.Provider>
      </AuthoritiesContext.Provider>
    );

    await waitFor(() => expect(mockPrimaryEntityType).toHaveBeenCalled());

    expect(getByText(tiles.model.intro)).toBeInTheDocument(); // tile intro text

    expect(getByLabelText("switch-view")).toBeInTheDocument();
    expect(getByLabelText("switch-view-graph")).toBeChecked(); // Graph view is checked by default.
    expect(getByText("Entity Types")).toBeInTheDocument();
    expect(getByLabelText("graph-view-filter-input")).toBeInTheDocument();
    userEvent.click(getByLabelText("add-entity-type-relationship"));
    await waitFor(() => {
      expect(getByLabelText("add-entity-type")).toBeInTheDocument();
      expect(getByLabelText("add-relationship")).toBeInTheDocument();
    });

    userEvent.hover(getByLabelText("publish-to-database"));
    await waitFor(() => expect(getByText(ModelingTooltips.publish)).toBeInTheDocument());
    userEvent.hover(getByLabelText("graph-export"));
    await waitFor(() => expect(getByText(ModelingTooltips.exportGraph)).toBeInTheDocument());
  });

  it("can toggle between graph view and table view properly", async () => {
    mockPrimaryEntityType.mockResolvedValueOnce({status: 200, data: getEntityTypes});
    mockUpdateEntityModels.mockResolvedValueOnce({status: 200});

    const {getByText, getByLabelText, queryByLabelText, rerender} = render(
      <AuthoritiesContext.Provider value={mockDevRolesService}>
        <ModelingContext.Provider value={isModified}>
          <Router>
            <Modeling/>
          </Router>
        </ModelingContext.Provider>
      </AuthoritiesContext.Provider>
    );

    await waitFor(() => expect(mockPrimaryEntityType).toHaveBeenCalled());

    expect(getByText(tiles.model.intro)).toBeInTheDocument(); // tile intro text

    let graphViewButton = getByLabelText("switch-view-graph");
    let tableViewButton = getByLabelText("switch-view-table");
    let filterInput = getByLabelText("graph-view-filter-input");
    let addEntityOrRelationshipBtn = getByLabelText("add-entity-type-relationship");
    let publishToDatabaseBtn = getByLabelText("publish-to-database");
    let graphExportIcon = getByLabelText("graph-export");

    expect(getByLabelText("switch-view")).toBeInTheDocument();
    expect(graphViewButton).toBeChecked(); // Graph view is checked by default.
    expect(getByText("Entity Types")).toBeInTheDocument();
    expect(filterInput).toBeInTheDocument();
    expect(addEntityOrRelationshipBtn).toBeInTheDocument();
    expect(publishToDatabaseBtn).toBeInTheDocument();
    expect(graphExportIcon).toBeInTheDocument();
    expect(queryByLabelText("add-entity")).not.toBeInTheDocument();
    expect(queryByLabelText("Instances")).not.toBeInTheDocument();

    userEvent.click(tableViewButton); // switch to table view
    rerender(renderView("table"));
    expect(getByLabelText("add-entity")).toBeInTheDocument();
    expect(getByText("Instances")).toBeInTheDocument();
    expect(getByText("Last Processed")).toBeInTheDocument();
    expect(queryByLabelText("graph-view-filter-input")).not.toBeInTheDocument();
    expect(queryByLabelText("add-entity-type-relationship")).not.toBeInTheDocument();
    expect(queryByLabelText("graph-export")).not.toBeInTheDocument();

    userEvent.click(graphViewButton); // switch back to graph view
    rerender(renderView("graph"));
    expect(graphViewButton).toBeChecked();
    // TODO DHFPROD-7711 skipping failures to enable component replacement
    // expect(filterInput).toBeVisible();
    // expect(addEntityOrRelationshipBtn).toBeVisible();
    // expect(publishToDatabaseBtn).toBeVisible();
    // expect(graphExportIcon).toBeVisible();
  });
});


