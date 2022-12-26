import React from "react";
import {render, screen, wait, cleanup, act, fireEvent} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GraphView from "./graph-view";
import {ModelingContext} from "../../../util/modeling-context";
import {ModelingTooltips} from "../../../config/tooltips.config";
import {getEntityTypes, hubCentralConfig} from "../../../assets/mock-data/modeling/modeling";
import {isModified} from "../../../assets/mock-data/modeling/modeling-context-mock";

jest.mock("../../../api/modeling");
jest.mock("../../../api/environment");

describe("Graph View Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  const withEntityAs = (entityName: string, canReadEntityModel: boolean, canWriteEntityModel: boolean) => {
    let entityTypeNamesArrayUpdated = [...isModified.modelingOptions.entityTypeNamesArray,
      {
        name: entityName,
        entityTypeId: `http://marklogic.com/example/${entityName}-0.0.1/${entityName}`
      }
    ];
    let isModifiedUpdated = {...isModified, modelingOptions: {...isModified.modelingOptions, selectedEntity: entityName, entityTypeNamesArray: entityTypeNamesArrayUpdated}};
    return (<ModelingContext.Provider value={isModifiedUpdated}>
      <GraphView
        dataModel={getEntityTypes}
        canReadEntityModel={canReadEntityModel}
        canWriteEntityModel={canWriteEntityModel}
        deleteEntityType={jest.fn()}
        relationshipModalVisible={false}
        toggleRelationshipModal={jest.fn()}
        updateSavedEntity={jest.fn()}
        setDataModelFromServer={jest.fn()}
        hubCentralConfig={hubCentralConfig}
        updateHubCentralConfig={jest.fn()}
        setConfirmType={jest.fn()}
        toggleConfirmModal={() => true}
        toggleRevertConfirmModal={""}
        revertUnpublishedChanges={false}
        setRevertUnpublishedChanges={jest.fn()}
        toggleShowConceptClassModal={""}
        toggleIsEditConceptClassModal={""}
        updateConceptClassAndHideModal={jest.fn()}
        deleteConceptClass={jest.fn()}
        updateEntities={""}
        toggleShowEntityModal={""}
        toggleIsEditModal={""}
      />
    </ModelingContext.Provider>
    );
  };

  test("can view and close side panel for a selected entity within graph view", async () => {

    const mockDeleteEntity = jest.fn();

    const {getByTestId, getByLabelText, queryByLabelText, rerender} = render(
      <ModelingContext.Provider value={isModified}>
        <GraphView
          dataModel={getEntityTypes}
          canReadEntityModel={true}
          canWriteEntityModel={true}
          deleteEntityType={mockDeleteEntity}
          relationshipModalVisible={false}
          toggleRelationshipModal={jest.fn()}
          updateSavedEntity={jest.fn()}
          setDataModelFromServer={jest.fn()}
          hubCentralConfig={hubCentralConfig}
          updateHubCentralConfig={jest.fn()}
          setConfirmType={jest.fn()}
          toggleConfirmModal={() => true}
          toggleRevertConfirmModal={""}
          revertUnpublishedChanges={false}
          setRevertUnpublishedChanges={jest.fn()}
          toggleShowConceptClassModal={""}
          toggleIsEditConceptClassModal={""}
          updateConceptClassAndHideModal={jest.fn()}
          deleteConceptClass={jest.fn()}
          updateEntities={""}
          toggleShowEntityModal={""}
          toggleIsEditModal={""}
        />
      </ModelingContext.Provider>
    );

    expect(queryByLabelText("Product-selectedEntity")).not.toBeInTheDocument();

    rerender(withEntityAs("Product", true, true));
    await wait(() => expect(getByLabelText("Product-selectedEntity")).toBeInTheDocument());

    //Verify side panel content
    userEvent.hover(getByTestId("Product-delete"));
    await wait(() => expect(screen.getByText(ModelingTooltips.deleteIcon())).toBeInTheDocument());

    expect(getByLabelText("closeGraphViewSidePanel")).toBeInTheDocument();
    expect(getByLabelText("propertiesTabInSidePanel")).toBeInTheDocument();
    expect(getByLabelText("entityTypeTabInSidePanel")).toBeInTheDocument();

    //Closing side panel
    userEvent.click(getByLabelText("closeGraphViewSidePanel"));
  });

  test("can view, check properties as empty description and close side panel for selected entities within graph view", async () => {

    const mockDeleteEntity = jest.fn();

    const {getByTestId, getByLabelText, queryByLabelText, rerender, queryByPlaceholderText} = render(
      <ModelingContext.Provider value={isModified}>
        <GraphView
          dataModel={getEntityTypes}
          canReadEntityModel={true}
          canWriteEntityModel={true}
          deleteEntityType={mockDeleteEntity}
          relationshipModalVisible={false}
          toggleRelationshipModal={jest.fn()}
          updateSavedEntity={jest.fn()}
          setDataModelFromServer={jest.fn()}
          hubCentralConfig={hubCentralConfig}
          updateHubCentralConfig={jest.fn()}
          setConfirmType={jest.fn()}
          toggleConfirmModal={() => true}
          toggleRevertConfirmModal={""}
          revertUnpublishedChanges={false}
          setRevertUnpublishedChanges={jest.fn()}
          toggleShowConceptClassModal={""}
          toggleIsEditConceptClassModal={""}
          updateConceptClassAndHideModal={jest.fn()}
          deleteConceptClass={jest.fn()}
          updateEntities={""}
          toggleShowEntityModal={""}
          toggleIsEditModal={""}
        />
      </ModelingContext.Provider>
    );

    expect(queryByLabelText("Product-selectedEntity")).not.toBeInTheDocument();

    rerender(withEntityAs("Product", true, true));
    await wait(() => expect(getByLabelText("Product-selectedEntity")).toBeInTheDocument());

    //Verify side panel content
    await (() => expect(getByTestId("description")).toHaveValue("ajx"));

    //Render new entity and verify side panel content
    expect(queryByLabelText("Order-selectedEntity")).not.toBeInTheDocument();
    rerender(withEntityAs("Order", true, true));
    await wait(() => expect(getByLabelText("Order-selectedEntity")).toBeInTheDocument());
    expect(queryByPlaceholderText("Enter description"));

    userEvent.hover(getByTestId("Order-delete"));
    await (() => expect(screen.getByText(ModelingTooltips.deleteIcon())).toBeInTheDocument());

    expect(getByLabelText("closeGraphViewSidePanel")).toBeInTheDocument();
    expect(getByLabelText("propertiesTabInSidePanel")).toBeInTheDocument();
    expect(getByLabelText("entityTypeTabInSidePanel")).toBeInTheDocument();

    //Closing side panel
    userEvent.click(getByLabelText("closeGraphViewSidePanel"));
  });

  test("Publish button should be disabled when user don't have permission to write entity model", async () => {

    const mockDeleteEntity = jest.fn();

    const {getByLabelText} = render(
      <ModelingContext.Provider value={isModified}>
        <GraphView
          dataModel={getEntityTypes}
          canReadEntityModel={true}
          canWriteEntityModel={false}
          deleteEntityType={mockDeleteEntity}
          relationshipModalVisible={false}
          toggleRelationshipModal={jest.fn()}
          updateSavedEntity={jest.fn()}
          setDataModelFromServer={jest.fn()}
          hubCentralConfig={hubCentralConfig}
          updateHubCentralConfig={jest.fn()}
          setConfirmType={jest.fn()}
          toggleConfirmModal={() => true}
          toggleRevertConfirmModal={""}
          revertUnpublishedChanges={false}
          setRevertUnpublishedChanges={jest.fn()}
          toggleShowConceptClassModal={""}
          toggleIsEditConceptClassModal={""}
          updateConceptClassAndHideModal={jest.fn()}
          deleteConceptClass={jest.fn()}
          updateEntities={""}
          toggleShowEntityModal={""}
          toggleIsEditModal={""}
        />
      </ModelingContext.Provider>
    );

    expect(getByLabelText("publish-to-database")).toBeDisabled();
  });

  test("Validates modeling Graph UI text ", async () => {

    const mockDeleteEntity = jest.fn();

    const {getByText, getByLabelText, queryByLabelText, rerender, getAllByLabelText} = render(
      <ModelingContext.Provider value={isModified}>
        <GraphView
          dataModel={getEntityTypes}
          canReadEntityModel={true}
          canWriteEntityModel={true}
          deleteEntityType={mockDeleteEntity}
          relationshipModalVisible={false}
          toggleRelationshipModal={jest.fn()}
          updateSavedEntity={jest.fn()}
          setDataModelFromServer={jest.fn()}
          hubCentralConfig={hubCentralConfig}
          updateHubCentralConfig={jest.fn()}
          setConfirmType={jest.fn()}
          toggleConfirmModal={() => true}
          toggleRevertConfirmModal={""}
          revertUnpublishedChanges={false}
          setRevertUnpublishedChanges={jest.fn()}
          toggleShowConceptClassModal={""}
          toggleIsEditConceptClassModal={""}
          updateConceptClassAndHideModal={jest.fn()}
          deleteConceptClass={jest.fn()}
          updateEntities={""}
          toggleShowEntityModal={""}
          toggleIsEditModal={""}
        />
      </ModelingContext.Provider>
    );

    expect(queryByLabelText("Product-selectedEntity")).not.toBeInTheDocument();

    // Opens side panel
    rerender(withEntityAs("Product", true, true));
    await wait(() => expect(getByLabelText("Product-selectedEntity")).toBeInTheDocument());

    // Verifies side panel content
    const entityTypeTab = getByText("Entity Type");
    expect(entityTypeTab).toBeInTheDocument();
    act(() => {
      userEvent.click(entityTypeTab);
    });

    // Hovers over color question icon to see tooltip
    const tooltips = getAllByLabelText("icon: question-circle");
    // color tooltip has index 1 in the array
    fireEvent.mouseOver(tooltips[1]);

    const tooltip = await screen.findAllByLabelText("colorToolTip");
    expect(tooltip[0].lastChild?.textContent).toBe("Select a color to associate it with the Product entity throughout your project.");
    // Clicks on Add dropdown
    const addDropdown = getByText("Add");
    expect(addDropdown).toBeInTheDocument();
    act(() => {
      userEvent.click(addDropdown);
    });
    // Clicks on Add new relationship
    userEvent.click(getByText("Add new relationship"));
    expect(document.querySelector("#hc-alert-component-content")?.firstChild?.textContent)
      .toEqual("To add a relationship to the data model, drag the source entity type to the target entity type or a concept class. You can also click the source entity type to configure a relationship. Press Esc to exit this mode.");
  });

  test("Ready-only user should not be able to edit entity type description and namespace", async () => {
    const {getByText, getByLabelText, getByTestId} = render(withEntityAs("Product", true, false));

    // Opens side panel
    await wait(() => expect(getByLabelText("Product-selectedEntity")).toBeInTheDocument());

    // Verifies side panel content
    const entityTypeTab = getByText("Entity Type");
    expect(entityTypeTab).toBeInTheDocument();
    act(() => {
      userEvent.click(entityTypeTab);
    });

    // Verifies description field is not editable
    const descriptionField = getByTestId("description");
    expect(descriptionField).toBeInTheDocument();
    expect(descriptionField).toBeDisabled();

    // Verifies namespace field is not editable
    const namespaceField = getByTestId("namespace");
    expect(namespaceField).toBeInTheDocument();
    expect(namespaceField).toBeDisabled();
  });
});