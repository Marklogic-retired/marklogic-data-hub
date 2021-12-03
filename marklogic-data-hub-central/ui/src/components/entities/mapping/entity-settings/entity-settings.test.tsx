import React from "react";
import {fireEvent, render} from "@testing-library/react";
import EntitySettings from "./entity-settings";
import steps from "../../../../assets/mock-data/curation/steps.data";

describe("Entity settings component tests", () => {

  test("Verify cancel button onclick is called", () => {
    const {getByText, getByTestId} = render(<EntitySettings canReadWrite={true} tooltipsData={{}} updateStep={jest.fn()} stepData={steps.stepMapping} entityMappingId={""} entityTitle={"Person"}/>);

    fireEvent.click(getByTestId("Person-entity-settings"));
    const cancelButton = getByText("Cancel");
    cancelButton.onclick = jest.fn();
    fireEvent.click(cancelButton);
    expect(cancelButton.onclick).toHaveBeenCalledTimes(1);
  });

  test("Verify save button onclick is called", () => {
    const updateStepMock = jest.fn();
    const {getByText, getByTestId} = render(<EntitySettings canReadWrite={true} tooltipsData={{}} updateStep={updateStepMock} stepData={steps.stepMapping} entityMappingId={""} entityTitle={"Person"}/>);

    fireEvent.click(getByTestId("Person-entity-settings"));
    const saveButton = getByText("Save");
    saveButton.onclick = jest.fn();
    fireEvent.click(saveButton);
    expect(saveButton.onclick).toHaveBeenCalledTimes(1);
    expect(updateStepMock).toHaveBeenCalledTimes(1);
  });

  test("Verify entity settings for Mapping", async () => {
    const {getByText, getByTestId, getByPlaceholderText} = render(<EntitySettings canReadWrite={true} tooltipsData={{}} updateStep={jest.fn()} stepData={steps.stepMapping} entityMappingId={""} entityTitle={"Person"}/>);

    fireEvent.click(getByTestId("Person-entity-settings"));

    //verify Target Collections, not able to send input to additional collections
    expect(getByText("Target Collections:")).toBeInTheDocument();
    expect(getByText("addedCollection")).toBeInTheDocument();

    //verify Default Collections
    expect(getByText("Default Collections:")).toBeInTheDocument();
    expect(getByText("AdvancedMapping")).toBeInTheDocument();

    //verify Target Permissions
    expect(getByText("Target Permissions:")).toBeInTheDocument();
    fireEvent.change(getByPlaceholderText("Please enter target permissions"), {target: {value: "data-hub-operator"}});
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("data-hub-operator");
    fireEvent.blur(getByPlaceholderText("Please enter target permissions"));

    expect(getByTestId("validationError")).toHaveTextContent("The format of the string is incorrect. The required format is role,capability,role,capability,....");

    fireEvent.change(getByPlaceholderText("Please enter target permissions"), {target: {value: "data-hub-operator,read"}});
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("data-hub-operator,read");
    fireEvent.blur(getByPlaceholderText("Please enter target permissions"));
    expect(getByTestId("validationError")).toHaveTextContent("");
  });

});