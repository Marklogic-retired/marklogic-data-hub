import React from "react";
import {render, fireEvent, cleanup, wait, waitForElement} from "@testing-library/react";
import AddEditRelationship from "./add-edit-relationship";
import {ModelingTooltips} from "../../../../config/tooltips.config";
import {mockEditRelationshipInfo, mockAddRelationshipInfo, entityTypesWithRelationship, mockHubCentralConfig} from "../../../../assets/mock-data/modeling/modeling";

jest.mock("axios");
describe("Add Edit Relationship component", () => {

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test("Verify Edit Relationship dialog renders correctly", async () => {
    const updateSavedEntity = jest.fn(() => {});
    const {getByText, getByTestId, getByLabelText, queryByLabelText, queryByText, queryByTestId} = render(
      <AddEditRelationship
        openRelationshipModal={true}
        setOpenRelationshipModal={jest.fn()}
        isEditing={true}
        relationshipInfo={mockEditRelationshipInfo}
        entityTypes={entityTypesWithRelationship}
        relationshipModalVisible={true}
        toggleRelationshipModal={true}
        updateSavedEntity={updateSavedEntity}
        canReadEntityModel={true}
        canWriteEntityModel={true}
        hubCentralConfig={mockHubCentralConfig}
      />
    );

    expect(getByText("Edit Relationship")).toBeInTheDocument();
    expect(getByLabelText("header-message")).toHaveTextContent("");
    expect(getByText("SOURCE")).toBeInTheDocument();
    expect(getByText("TARGET")).toBeInTheDocument();
    expect(getByTestId("delete-relationship")).toBeInTheDocument();

    //source and target node names are displayed
    expect(getByTestId("BabyRegistry-sourceNodeName")).toHaveTextContent("BabyRegistry");
    expect(getByTestId("Customer-targetNodeName")).toHaveTextContent("Customer");

    //cardinality button is displayed and can be toggled
    expect(getByTestId("oneToOneIcon")).toBeInTheDocument();
    fireEvent.click(getByTestId("cardinalityButton"));
    expect(getByTestId("oneToManyIcon")).toBeInTheDocument();

    //foreign key is populated, so "Optional" is expanded and field is visible by default and populated and can be changed
    expect(getByText("Optional")).toBeInTheDocument();
    expect(queryByText("You can select the foreign key now or later:")).toBeInTheDocument();

    fireEvent.mouseOver(getByTestId("foreign-key-tooltip"));
    await wait(() => expect(getByText(ModelingTooltips.foreignKeyInfo)).toBeInTheDocument());

    expect(getByText("customerId")).toBeInTheDocument();
    fireEvent.keyDown(getByLabelText("foreignKey-dropdown"), {key: "ArrowDown"});
    expect(getByLabelText("None-option")).toBeInTheDocument();
    expect(getByLabelText("name-option")).toBeInTheDocument();
    expect(getByLabelText("email-option")).toBeInTheDocument();
    expect(getByLabelText("pin-option")).toBeInTheDocument();
    expect(getByLabelText("shipping-option")).toBeInTheDocument();
    expect(getByLabelText("billing-option")).toBeInTheDocument();

    fireEvent.click(getByLabelText("email-option"));
    expect(getByText("email")).toBeInTheDocument();

    //input fields should be populated with existing relationship info by default
    const relationshipInput = getByLabelText("relationship-textarea");
    expect(relationshipInput).toHaveValue("ownedBy");

    //change relationship name
    fireEvent.change(relationshipInput, {target: {value: ""}});

    expect(queryByLabelText("error-circle")).not.toBeInTheDocument();
    expect(queryByText(ModelingTooltips.relationshipEmpty)).not.toBeInTheDocument();

    //verify error message is only present upon Save click
    fireEvent.click(getByText("Save"));
    wait(() => expect(getByLabelText("error-circle")).toBeInTheDocument());
    fireEvent.mouseOver(getByTestId("error-circle"));
    wait(() => expect(getByText(ModelingTooltips.relationshipEmpty)).toBeInTheDocument());

    //error icon disappears
    fireEvent.change(relationshipInput, {target: {value: "usedBy"}});
    wait(() => expect(queryByLabelText("error-circle")).not.toBeInTheDocument());

    //target entity dropdown should not exist in Edit Relationship
    expect(queryByTestId("targetEntityDropdown")).not.toBeInTheDocument();
  });

  test("Verify Add Relationship dialog renders correctly", async () => {
    const updateSavedEntity = jest.fn(() => {});
    const {getByText, getByTestId, getByLabelText, queryByText, rerender, getAllByRole} = render(
      <AddEditRelationship
        openRelationshipModal={true}
        setOpenRelationshipModal={jest.fn()}
        isEditing={false}
        relationshipInfo={mockAddRelationshipInfo}
        entityTypes={entityTypesWithRelationship}
        relationshipModalVisible={true}
        toggleRelationshipModal={true}
        updateSavedEntity={updateSavedEntity}
        canReadEntityModel={true}
        canWriteEntityModel={true}
        hubCentralConfig={mockHubCentralConfig}
      />
    );
    expect(getByText("Add a Relationship")).toBeInTheDocument();
    expect(getByLabelText("addRelationshipHeader")).toBeInTheDocument();
    expect(getByText("SOURCE")).toBeInTheDocument();
    expect(getByText("TARGET")).toBeInTheDocument();
    expect(getByTestId("delete-relationship")).toBeInTheDocument();

    //source node name and placeholder target node name displayed
    expect(getByTestId("BabyRegistry-sourceNodeName")).toHaveTextContent("BabyRegistry");
    expect(getByTestId("Select target entity type*-targetNodeName")).toHaveTextContent("Select target entity type*");

    //foreign key is hidden under "Optional" line at first
    expect(getByText("Optional")).toBeInTheDocument();
    expect(queryByText("You can select the foreign key now or later:")).not.toBeInTheDocument();

    //expand "Optional" line
    fireEvent.click(getByText("Optional"));

    //foreign key dropdown is empty with placeholder
    expect(getByText("You can select the foreign key now or later:")).toBeInTheDocument();
    expect(getByText("Select foreign key")).toBeInTheDocument();

    // verify error message upon Save click with no selected entity, entity selection tested in e2e
    fireEvent.click(getByText("Add"));
    wait(() => expect(getByLabelText("error-circle")).toBeInTheDocument());
    fireEvent.mouseOver(getByTestId("error-circle"));
    wait(() => expect(getByText(ModelingTooltips.targetEntityEmpty)).toBeInTheDocument());

    const mockRelationshipWithTarget = {...mockAddRelationshipInfo, targetNodeName: "Customer", targetNodeColor: "#ecf7fd"};

    rerender(<AddEditRelationship
      openRelationshipModal={true}
      setOpenRelationshipModal={jest.fn()}
      isEditing={false}
      relationshipInfo={mockRelationshipWithTarget}
      entityTypes={entityTypesWithRelationship}
      relationshipModalVisible={true}
      toggleRelationshipModal={true}
      updateSavedEntity={updateSavedEntity}
      canReadEntityModel={true}
      canWriteEntityModel={true}
      hubCentralConfig={mockHubCentralConfig}
    />
    );
    //verify duplicate property error message with relationship name same as entity name
    fireEvent.change(getByLabelText("relationship-textarea"), {target: {value: "BabyRegistry"}});
    fireEvent.click(getByText("Add"));
    wait(() => expect(getByLabelText("error-circle")).toBeInTheDocument());
    fireEvent.mouseOver(getByTestId("error-circle"));
    wait(() => expect(getByTestId("name-error")).toBeInTheDocument());

    //verify node colors and updated colors with target entity selections
    expect(getByTestId("sourceEntityNode")).toHaveStyle("background-color: rgb(227, 235, 188)"); //to have BabyRegistry color

    expect(getByTestId("targetEntityNode")).toHaveStyle("background-color: rgb(236, 247, 253)"); //to have Customer color

    fireEvent.click(getByTestId("targetEntityDropdown"));
    await (waitForElement(() => getAllByRole("option"), {"timeout": 200}));
    expect(getByTestId("Order-option")).toBeInTheDocument();
    fireEvent.click(getByTestId("Order-option"));
    expect(getByTestId("Order-targetNodeName")).toHaveTextContent("Order");
    expect(getByTestId("targetEntityNode")).toHaveStyle("background-color: rgb(232, 250, 244)"); //to have Order color
  });
});
