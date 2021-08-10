import React from "react";
import {render, fireEvent, cleanup, wait} from "@testing-library/react";
import AddEditRelationship from "./add-edit-relationship";
import {ModelingTooltips} from "../../../../config/tooltips.config";
import {mockRelationshipInfo, entityTypesWithRelationship} from "../../../../assets/mock-data/modeling/modeling";

jest.mock("axios");
describe("Add Edit Relationship component", () => {

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test("Verify Edit Relationoship dialog renders correctly", () => {
    const updateSavedEntity = jest.fn(() => {});
    const {getByText, getByTestId, getByLabelText, queryByLabelText, queryByText} = render(
      <AddEditRelationship
        openRelationshipModal={true}
        setOpenRelationshipModal={jest.fn()}
        isEditing={true}
        relationshipInfo={mockRelationshipInfo}
        entityTypes={entityTypesWithRelationship}
        relationshipModalVisible={true}
        toggleRelationshipModal={true}
        updateSavedEntity={updateSavedEntity}
      />
    );

    expect(getByText("Edit Relationship")).toBeInTheDocument();
    expect(getByText("SOURCE")).toBeInTheDocument();
    expect(getByText("TARGET")).toBeInTheDocument();
    expect(getByTestId("delete-relationship")).toBeInTheDocument();

    //source and target node names are displayed
    expect(getByTestId("sourceNodeName")).toHaveTextContent("BabyRegistry");
    expect(getByTestId("targetNodeName")).toHaveTextContent("Customer");

    //cardinality button is displayed and can be toggled
    expect(getByTestId("oneToOneIcon")).toBeInTheDocument();
    fireEvent.click(getByTestId("cardinalityButton"));
    expect(getByTestId("oneToManyIcon")).toBeInTheDocument();

    //join property dropdown is populated and can be changed
    let joinPropertySelection = getByText(
      (_content, element) =>
        element.className !== null &&
        element.className === "ant-select-selection-selected-value");

    expect(joinPropertySelection).toHaveTextContent("customerId");
    fireEvent.click(getByTestId("join-property-dropdown"));
    expect(getByLabelText("name-option")).toBeInTheDocument();
    expect(getByLabelText("email-option")).toBeInTheDocument();
    expect(getByLabelText("pin-option")).toBeInTheDocument();
    expect(getByLabelText("shipping-option")).toBeInTheDocument();
    expect(getByLabelText("billing-option")).toBeInTheDocument();

    fireEvent.click(getByLabelText("email-option"));
    joinPropertySelection = getByText(
      (_content, element) =>
        element.className !== null &&
        element.className === "ant-select-selection-selected-value");
    wait(() => expect(joinPropertySelection).toHaveTextContent("email"));

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
    fireEvent.mouseOver(getByLabelText("error-circle"));
    wait(() => expect(getByText(ModelingTooltips.relationshipEmpty)).toBeInTheDocument());

    //error icon disappears
    fireEvent.change(relationshipInput, {target: {value: "usedBy"}});
    wait(() => expect(queryByLabelText("error-circle")).not.toBeInTheDocument());
  });

});
