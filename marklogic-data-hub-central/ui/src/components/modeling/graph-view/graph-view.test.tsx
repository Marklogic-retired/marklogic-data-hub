import React from "react";
import {render, screen, wait, cleanup} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GraphView from "./graph-view";
import {ModelingContext} from "../../../util/modeling-context";
import {ModelingTooltips} from "../../../config/tooltips.config";
import {getEntityTypes} from "../../../assets/mock-data/modeling/modeling";
import {isModified} from "../../../assets/mock-data/modeling/modeling-context-mock";
import "jest-canvas-mock";

jest.mock("../../../api/modeling");
jest.mock("../../../api/environment");

describe("Graph View Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  const withEntityAs = (entityName) => {
    let entityTypeNamesArrayUpdated = [...isModified.modelingOptions.entityTypeNamesArray,
      {
        name: entityName,
        entityTypeId: `http://marklogic.com/example/${entityName}-0.0.1/${entityName}`
      }
    ];
    let isModifiedUpdated = {...isModified, modelingOptions: {...isModified.modelingOptions, selectedEntity: entityName, entityTypeNamesArray: entityTypeNamesArrayUpdated}};
    return (<ModelingContext.Provider value={isModifiedUpdated}>
      <GraphView
        entityTypes={getEntityTypes}
        canReadEntityModel={true}
        canWriteEntityModel={true}
        deleteEntityType={jest.fn()}
        relationshipModalVisible={false}
        toggleRelationshipModal={jest.fn()}
        updateSavedEntity={jest.fn()}
        setEntityTypesFromServer={jest.fn()}
      />
    </ModelingContext.Provider>
    );
  };

  test("can view and close side panel for a selected entity within graph view", async () => {

    const mockDeleteEntity = jest.fn();

    const {getByTestId, getByLabelText, queryByLabelText, rerender} =  render(
      <ModelingContext.Provider value={isModified}>
        <GraphView
          entityTypes={getEntityTypes}
          canReadEntityModel={true}
          canWriteEntityModel={true}
          deleteEntityType={mockDeleteEntity}
          relationshipModalVisible={false}
          toggleRelationshipModal={jest.fn()}
          updateSavedEntity={jest.fn()}
          setEntityTypesFromServer={jest.fn()}
        />
      </ModelingContext.Provider>
    );

    expect(queryByLabelText("Product-selectedEntity")).not.toBeInTheDocument();

    rerender(withEntityAs("Product"));
    await wait(() => expect(getByLabelText("Product-selectedEntity")).toBeInTheDocument());

    //Verify side panel content

    userEvent.hover(getByTestId("Product-delete"));
    await wait(() => expect(screen.getByText(ModelingTooltips.deleteIcon)).toBeInTheDocument());

    expect(getByLabelText("closeGraphViewSidePanel")).toBeInTheDocument();
    expect(getByLabelText("propertiesTabInSidePanel")).toBeInTheDocument();
    expect(getByLabelText("entityTypeTabInSidePanel")).toBeInTheDocument();

    //Closing side panel
    userEvent.click(getByLabelText("closeGraphViewSidePanel"));
  });
});