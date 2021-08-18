import React from "react";
import {BrowserRouter as Router} from "react-router-dom";
import {render, wait, screen, within, fireEvent} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EntityTypeTable from "./entity-type-table";
import {ModelingTooltips, SecurityTooltips} from "../../../config/tooltips.config";
import {validateTableRow} from "../../../util/test-utils";

import {
  entityReferences,
  deleteEntity,
  updateEntityModels
} from "../../../api/modeling";

import {
  getEntityTypes,
  hubCentralConfig,
  referencePayloadEmpty,
  referencePayloadForeignKey,
  referencePayloadSteps
} from "../../../assets/mock-data/modeling/modeling";

import {ConfirmationType} from "../../../types/common-types";
import {ModelingContext} from "../../../util/modeling-context";
import {isModified} from "../../../assets/mock-data/modeling/modeling-context-mock";

jest.mock("../../../api/modeling");

const mockEntityReferences = entityReferences as jest.Mock;
const mockDeleteEntity = deleteEntity as jest.Mock;
const mockUpdateEntityModels = updateEntityModels as jest.Mock;

describe("EntityTypeModal Component", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Table renders with empty array prop", () => {
    const {getByText} =  render(
      <Router>
        <EntityTypeTable
          allEntityTypesData={[]}
          canReadEntityModel={true}
          canWriteEntityModel={true}
          autoExpand=""
          editEntityTypeDescription={jest.fn()}
          updateEntities={jest.fn()}
          updateSavedEntity={jest.fn()}
          hubCentralConfig={{}}
        />
      </Router>);

    expect(getByText("Name")).toBeInTheDocument();
    expect(getByText("Instances")).toBeInTheDocument();
    expect(getByText("Last Processed")).toBeInTheDocument();
    expect(getByText("Color")).toBeInTheDocument();
  });

  // TODO DHFPROD-7711 skipping failing tests to enable component replacement
  test.skip("Table renders with mock data, no writer role", async () => {
    const {getByText, getByTestId, getByLabelText} =  render(
      <Router>
        <EntityTypeTable
          allEntityTypesData={getEntityTypes}
          canReadEntityModel={true}
          canWriteEntityModel={false}
          autoExpand=""
          editEntityTypeDescription={jest.fn()}
          updateEntities={jest.fn()}
          updateSavedEntity={jest.fn()}
          hubCentralConfig={hubCentralConfig}
        />
      </Router>);

    expect(getByText(/Customer/i)).toBeInTheDocument();
    expect(getByText(/1,000/i)).toBeInTheDocument();
    expect(getByTestId("Customer-last-processed")).toBeInTheDocument();

    expect(getByTestId("Customer-trash-icon")).toHaveClass("iconTrashReadOnly");

    // test trash icons display correct tooltip when disabled
    fireEvent.mouseOver(getByTestId("Customer-trash-icon"));
    await wait(() => expect(getByText("Delete Entity: " + SecurityTooltips.missingPermission)).toBeInTheDocument());

    expect(getByText(/Order/i)).toBeInTheDocument();
    expect(getByText(/2,384/i)).toBeInTheDocument();
    expect(getByTestId("Order-last-processed")).toBeInTheDocument();

    const anotherModelExpandIcon = getByTestId("mltable-expand-AnotherModel");
    userEvent.click(within(anotherModelExpandIcon).getByRole("img"));

    expect(getByLabelText("AnotherModel-add-property")).toBeDisabled();

    //Verify individual colors are rendered for each entity in table view
    expect(getByTestId("AnotherModel-#D5D3DD-color")).toBeInTheDocument();
    expect(getByTestId("Order-#CEE0ED-color")).toBeInTheDocument();
    expect(getByTestId("Protein-#D9F5F0-color")).toBeInTheDocument();
    expect(getByTestId("Product-#C9EBC4-color")).toBeInTheDocument();
    expect(getByTestId("Provider-#E7B8B2-color")).toBeInTheDocument();
    expect(getByTestId("TestEntityForMapping-#FFF0A3-color")).toBeInTheDocument();
    expect(getByTestId("Customer-#F6D4A7-color")).toBeInTheDocument();

    //Verify sorting works as expected in entity table
    let entityTable = document.querySelectorAll(".ant-table-row-level-0");

    //Initial sort should be in descending 'Last Processed' order
    validateTableRow(entityTable, ["AnotherModel", "Protein", "Product", "Provider", "TestEntityForMapping", "Order", "Customer"]);
    //verify sort by ascending 'Last Processed' order is next and works
    fireEvent.click(getByTestId("lastProcessed"));
    entityTable = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(entityTable, ["Customer", "Order", "AnotherModel", "Protein", "Product", "Provider", "TestEntityForMapping"]);
    //verify third click does not return to default, but returns to descending order
    fireEvent.click(getByTestId("lastProcessed"));
    entityTable = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(entityTable, ["AnotherModel", "Protein", "Product", "Provider", "TestEntityForMapping", "Order", "Customer"]);

    //verify sort by name alphabetically works in ascending order
    fireEvent.click(getByTestId("entityName"));
    entityTable = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(entityTable, ["AnotherModel", "Customer", "Order", "Product", "Protein", "Provider", "TestEntityForMapping"]);
    //verify sort by name alphabetically works in descending order
    fireEvent.click(getByTestId("entityName"));
    entityTable = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(entityTable, ["TestEntityForMapping", "Provider", "Protein", "Product", "Order", "Customer", "AnotherModel"]);
    //verify third click does not return to default, but returns to ascending order
    fireEvent.click(getByTestId("entityName"));
    entityTable = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(entityTable, ["AnotherModel", "Customer", "Order", "Product", "Protein", "Provider", "TestEntityForMapping"]);

    //verify sort by instances works in ascending order
    fireEvent.click(getByTestId("Instances"));
    entityTable = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(entityTable, ["AnotherModel", "Protein", "Product", "Provider", "TestEntityForMapping", "Customer", "Order"]);
    //verify sort by instances works in descending order
    fireEvent.click(getByTestId("Instances"));
    entityTable = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(entityTable, ["Order", "Customer", "AnotherModel", "Protein", "Product", "Provider", "TestEntityForMapping", "Order", "Customer"]);
    //verify third click does not return to default, but returns to ascending order
    fireEvent.click(getByTestId("Instances"));
    entityTable = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(entityTable, ["AnotherModel", "Protein", "Product", "Provider", "TestEntityForMapping", "Customer", "Order"]);

  });

  test("Table renders with mock data, with writer role, with auto expanded entity, and can click edit", () => {
    const editMock = jest.fn();
    const {getByTestId} =  render(
      <Router>
        <EntityTypeTable
          allEntityTypesData={getEntityTypes}
          canReadEntityModel={true}
          canWriteEntityModel={true}
          autoExpand="Order"
          editEntityTypeDescription={editMock}
          updateEntities={jest.fn()}
          updateSavedEntity={jest.fn()}
          hubCentralConfig={hubCentralConfig}
        />
      </Router>);

    // Add back once functionality is added
    expect(getByTestId("Order-trash-icon")).toHaveClass("iconTrash");

    userEvent.click(getByTestId("Order-span"));
    expect(editMock).toBeCalledTimes(1);
  });

  test("Table can mock delete entity", async () => {
    mockEntityReferences.mockResolvedValueOnce({status: 200, data: referencePayloadEmpty});
    mockDeleteEntity.mockResolvedValueOnce({status: 200});

    const updateMock = jest.fn();

    const {getByTestId} =  render(
      <Router>
        <EntityTypeTable
          allEntityTypesData={getEntityTypes}
          canReadEntityModel={true}
          canWriteEntityModel={true}
          autoExpand=""
          editEntityTypeDescription={jest.fn()}
          updateEntities={updateMock}
          updateSavedEntity={jest.fn()}
          hubCentralConfig={hubCentralConfig}
        />
      </Router>);

    // check if delete tooltip appears
    fireEvent.mouseOver(getByTestId("Order-trash-icon"));
    await wait(() => expect(screen.getByText(ModelingTooltips.deleteIcon)).toBeInTheDocument());

    userEvent.click(getByTestId("Order-trash-icon"));
    expect(mockEntityReferences).toBeCalledWith("Order");
    expect(mockEntityReferences).toBeCalledTimes(1);

    await wait(() =>
      expect(screen.getByLabelText("delete-text")).toBeInTheDocument(),
    );

    userEvent.click(screen.getByLabelText(`confirm-${ConfirmationType.DeleteEntity}-yes`));

    expect(mockDeleteEntity).toBeCalledTimes(1);
  });

  /* TODO: - This test should be uncommented as part of DHFPROD-7845
  test("Table can mock delete relationship entity", async () => {
    mockEntityReferences.mockResolvedValueOnce({status: 200, data: referencePayloadRelationships});
    mockDeleteEntity.mockResolvedValueOnce({status: 200});

    const updateMock = jest.fn();

    const {getByTestId} =  render(
      <Router>
        <EntityTypeTable
          allEntityTypesData={getEntityTypes}
          canReadEntityModel={true}
          canWriteEntityModel={true}
          autoExpand=""
          editEntityTypeDescription={jest.fn()}
          updateEntities={updateMock}
          updateSavedEntity={jest.fn()}
        />
      </Router>);

    userEvent.click(getByTestId("Product-trash-icon"));
    expect(mockEntityReferences).toBeCalledWith("Product");
    expect(mockEntityReferences).toBeCalledTimes(1);

    await wait(() =>
      expect(screen.getByLabelText("delete-relationship-text")).toBeInTheDocument()
    );
    expect(screen.getByText("Existing entity type relationships.")).toBeInTheDocument();
    userEvent.click(screen.getByLabelText(`confirm-${ConfirmationType.DeleteEntityRelationshipWarn}-yes`));

    expect(mockDeleteEntity).toBeCalledTimes(1);
  });
  */

  test("can show confirm modal for delete steps", async () => {
    mockEntityReferences.mockResolvedValueOnce({status: 200, data: referencePayloadSteps});
    mockDeleteEntity.mockResolvedValueOnce({status: 200});

    const updateMock = jest.fn();

    const {getByTestId} =  render(
      <Router>
        <EntityTypeTable
          allEntityTypesData={getEntityTypes}
          canReadEntityModel={true}
          canWriteEntityModel={true}
          autoExpand=""
          editEntityTypeDescription={jest.fn()}
          updateEntities={updateMock}
          updateSavedEntity={jest.fn()}
          hubCentralConfig={hubCentralConfig}
        />
      </Router>);

    userEvent.click(getByTestId("Product-trash-icon"));
    expect(mockEntityReferences).toBeCalledWith("Product");
    expect(mockEntityReferences).toBeCalledTimes(1);

    await wait(() =>
      expect(screen.getByLabelText("delete-step-text")).toBeInTheDocument()
    );
    expect(screen.getByText("Entity type is used in one or more steps.")).toBeInTheDocument();
    userEvent.click(screen.getByLabelText(`confirm-${ConfirmationType.DeleteEntityStepWarn}-close`));
    expect(mockDeleteEntity).toBeCalledTimes(0);
  });

  test("Prevent deleting entity with foreign key relationship", async () => {
    mockEntityReferences.mockResolvedValueOnce({status: 200, data: referencePayloadForeignKey});
    mockDeleteEntity.mockResolvedValueOnce({status: 200});

    const updateMock = jest.fn();

    const {getByTestId, getByLabelText, getByText, queryByText} =  render(
      <Router>
        <EntityTypeTable
          allEntityTypesData={getEntityTypes}
          canReadEntityModel={true}
          canWriteEntityModel={true}
          autoExpand=""
          editEntityTypeDescription={jest.fn()}
          updateEntities={updateMock}
          updateSavedEntity={jest.fn()}
          hubCentralConfig={hubCentralConfig}
        />
      </Router>);

    userEvent.click(getByTestId("Product-trash-icon"));
    expect(mockEntityReferences).toBeCalledWith("Product");
    expect(mockEntityReferences).toBeCalledTimes(1);

    await wait(() =>
      expect(screen.getByLabelText("delete-entity-foreign-key-text")).toBeInTheDocument()
    );
    expect(screen.getByText("Entity type appears in foreign key relationship in 1 or more other entity types.")).toBeInTheDocument();


    expect(getByText("Show Entities in foreign key relationship...")).toBeInTheDocument();
    expect(queryByText("Hide Entities in foreign key relationship...")).toBeNull();
    userEvent.click(getByLabelText("toggle-entities"));

    expect(getByText("Hide Entities in foreign key relationship...")).toBeInTheDocument();
    expect(queryByText("Show Entities in foreign key relationship...")).toBeNull();

    expect(screen.getByTestId("entitiesWithForeignKeyReferences")).toHaveTextContent(referencePayloadForeignKey.entityNamesWithForeignKeyReferences[0]);
    expect(screen.getByTestId("entitiesWithForeignKeyReferences")).toHaveTextContent(referencePayloadForeignKey.entityNamesWithForeignKeyReferences[1]);

    userEvent.click(getByLabelText("toggle-entities"));
    expect(getByText("Show Entities in foreign key relationship...")).toBeInTheDocument();
    expect(queryByText("Hide Entities in foreign key relationship...")).toBeNull();


    userEvent.click(screen.getByLabelText(`confirm-${ConfirmationType.DeleteEntityWithForeignKeyReferences}-close`));
    expect(mockDeleteEntity).toBeCalledTimes(0);
  });

  test("Table can mock delete entity with no relations and outstanding edits", async () => {
    mockEntityReferences.mockResolvedValueOnce({status: 200, data: referencePayloadEmpty});
    mockUpdateEntityModels.mockResolvedValueOnce({status: 200});
    mockDeleteEntity.mockResolvedValueOnce({status: 200});

    const {getByTestId} =  render(
      <ModelingContext.Provider value={isModified}>
        <Router>
          <EntityTypeTable
            allEntityTypesData={getEntityTypes}
            canReadEntityModel={true}
            canWriteEntityModel={true}
            autoExpand=""
            editEntityTypeDescription={jest.fn()}
            updateEntities={jest.fn()}
            updateSavedEntity={jest.fn()}
            hubCentralConfig={hubCentralConfig}
          />
        </Router>
      </ModelingContext.Provider>
    );

    userEvent.click(getByTestId("Product-trash-icon"));
    expect(mockEntityReferences).toBeCalledWith("Product");
    expect(mockEntityReferences).toBeCalledTimes(1);

    await wait(() =>
      expect(screen.getByLabelText("delete-text")).toBeInTheDocument(),
    );
    userEvent.click(screen.getByLabelText(`confirm-${ConfirmationType.DeleteEntity}-yes`));
    expect(mockDeleteEntity).toBeCalledTimes(1);
  });

  test("Verify pagination hiding", async () => {
    const {container} =  render(
      <Router>
        <EntityTypeTable
          allEntityTypesData={getEntityTypes}
          canReadEntityModel={true}
          canWriteEntityModel={false}
          autoExpand=""
          editEntityTypeDescription={jest.fn()}
          updateEntities={jest.fn()}
          updateSavedEntity={jest.fn()}
          hubCentralConfig={hubCentralConfig}
        />
      </Router>);

    expect(container.querySelector(".ant-pagination")).toBeNull();
  });

  test("can mock navigation to graph view", async () => {
    mockEntityReferences.mockResolvedValueOnce({status: 200, data: referencePayloadEmpty});
    mockDeleteEntity.mockResolvedValueOnce({status: 200});

    const updateMock = jest.fn();

    const {getByTestId} =  render(
      <ModelingContext.Provider value={isModified}>
        <Router>
          <EntityTypeTable
            allEntityTypesData={getEntityTypes}
            canReadEntityModel={true}
            canWriteEntityModel={true}
            autoExpand=""
            editEntityTypeDescription={jest.fn()}
            updateEntities={updateMock}
            updateSavedEntity={jest.fn()}
            hubCentralConfig={hubCentralConfig}
          />
        </Router>
      </ModelingContext.Provider>
    );

    // check if graph view icon tooltip appears
    fireEvent.mouseOver(getByTestId("Order-graphView-icon"));
    await wait(() => expect(screen.getByText(ModelingTooltips.viewGraph)).toBeInTheDocument());

    userEvent.click(getByTestId("Order-graphView-icon"));
    expect(isModified.setGraphViewOptions).toBeCalledWith({view: "graph", selectedEntity: "Order"});
  });

});

