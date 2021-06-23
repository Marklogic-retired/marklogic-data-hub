import React from "react";
import {render, screen, wait, cleanup} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GraphView from "./graph-view";
import {ModelingContext} from "../../../util/modeling-context";
import {ModelingTooltips} from "../../../config/tooltips.config";
import {getEntityTypes} from "../../../assets/mock-data/modeling/modeling";
import {isModified} from "../../../assets/mock-data/modeling/modeling-context-mock";

jest.mock("../../../api/modeling");
jest.mock("../../../api/environment");

describe("Graph View Component", () => {
  window.scrollTo = jest.fn();
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  const withEntityAs = (entityName) => {
    let isModifiedUpdated = {...isModified, modelingOptions: {... isModified.modelingOptions, selectedEntity: entityName}};
    return (<ModelingContext.Provider value={isModifiedUpdated}>
      <GraphView
        entityTypes={getEntityTypes}
      />
    </ModelingContext.Provider>
    );
  };

  test("can view and close side panel for a selected entity within graph view", async () => {

    const {getByTestId, getByLabelText, queryByLabelText, queryByTestId, rerender} =  render(
      <ModelingContext.Provider value={isModified}>
        <GraphView
          entityTypes={getEntityTypes}
        />
      </ModelingContext.Provider>
    );
    let productEntity = getByTestId("Product-entityNode");

    expect(queryByLabelText("Product-selectedEntity")).not.toBeInTheDocument();
    userEvent.click(productEntity);
    expect(isModified.setSelectedEntity).toBeCalledWith("Product");
    rerender(withEntityAs("Product"));

    //Verify side panel content
    expect(getByLabelText("Product-selectedEntity")).toBeInTheDocument();

    userEvent.hover(getByTestId("Product-delete"));
    await wait(() => expect(screen.getByText(ModelingTooltips.deleteIcon)).toBeInTheDocument());

    expect(getByLabelText("closeGraphViewSidePanel")).toBeInTheDocument();
    expect(getByLabelText("propertiesTabInSidePanel")).toBeInTheDocument();
    expect(getByLabelText("entityTypeTabInSidePanel")).toBeInTheDocument();

    //Closing side panel
    userEvent.click(getByLabelText("closeGraphViewSidePanel"));
    expect(queryByLabelText("Product-selectedEntity")).not.toBeInTheDocument();
    expect(queryByTestId("Product-delete")).not.toBeInTheDocument();
    expect(queryByLabelText("closeGraphViewSidePanel")).not.toBeInTheDocument();
    expect(queryByLabelText("propertiesTabInSidePanel")).not.toBeInTheDocument();
    expect(queryByLabelText("entityTypeTabInSidePanel")).not.toBeInTheDocument();
  });
});