import React from "react";
import {render} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ConfirmationModal from "./confirmation-modal";
import {ConfirmationType} from "../../types/common-types";

describe("Confirmation Modal Component", () => {

  test("can render identifier type confirmation", () => {
    let currentIdentifier = "userId";
    let newIdentifier = "customId";
    let toggleModal = jest.fn();
    let confirmAction = jest.fn();

    const {queryByLabelText, getByText, getAllByText, rerender} =  render(
      <ConfirmationModal
        isVisible={false}
        type={ConfirmationType.Identifer}
        boldTextArray={[currentIdentifier, newIdentifier]}
        toggleModal={toggleModal}
        confirmAction={confirmAction}
      />
    );

    expect(queryByLabelText("identifier-text")).toBeNull();

    rerender(<ConfirmationModal
      isVisible={true}
      type={ConfirmationType.Identifer}
      boldTextArray={[currentIdentifier, newIdentifier]}
      toggleModal={toggleModal}
      confirmAction={confirmAction}
    />);

    expect(getAllByText(currentIdentifier)).toHaveLength(3);
    expect(getByText(newIdentifier)).toBeInTheDocument();
    expect(getByText(/Each entity type is allowed a maximum of one identifier/i)).toBeInTheDocument();
    expect(getByText(/Are you sure you want to change the identifier from/i)).toBeInTheDocument();

    userEvent.click(getByText("No"));
    expect(toggleModal).toBeCalledTimes(1);

    userEvent.click(getByText("Yes"));
    expect(confirmAction).toBeCalledTimes(1);
  });

  test("can render delete type confirmation", () => {
    let entityName = "Product";
    let toggleModal = jest.fn();
    let confirmAction = jest.fn();

    const {queryByLabelText, getByText, rerender} =  render(
      <ConfirmationModal
        isVisible={false}
        type={ConfirmationType.DeleteEntity}
        boldTextArray={[entityName]}
        toggleModal={toggleModal}
        confirmAction={confirmAction}
      />
    );

    expect(queryByLabelText("delete-text")).toBeNull();

    rerender(<ConfirmationModal
      isVisible={true}
      type={ConfirmationType.DeleteEntity}
      boldTextArray={[entityName]}
      toggleModal={toggleModal}
      confirmAction={confirmAction}
    />);

    expect(getByText(entityName)).toBeInTheDocument();
    expect(getByText(/Permanently delete/i)).toBeInTheDocument();

    userEvent.click(getByText("No"));
    expect(toggleModal).toBeCalledTimes(1);

    userEvent.click(getByText("Yes"));
    expect(confirmAction).toBeCalledTimes(1);
  });

  test("can render delete type relationship warn confirmation", () => {
    let entityName = "Product";
    let toggleModal = jest.fn();
    let confirmAction = jest.fn();

    const {queryByLabelText, getByText, getAllByText, rerender} =  render(
      <ConfirmationModal
        isVisible={false}
        type={ConfirmationType.DeleteEntityRelationshipWarn}
        boldTextArray={[entityName]}
        toggleModal={toggleModal}
        confirmAction={confirmAction}
      />
    );

    expect(queryByLabelText("delete-relationship-text")).toBeNull();

    rerender(<ConfirmationModal
      isVisible={true}
      type={ConfirmationType.DeleteEntityRelationshipWarn}
      boldTextArray={[entityName]}
      toggleModal={toggleModal}
      confirmAction={confirmAction}
    />);

    expect(getAllByText(entityName)).toHaveLength(3);
    expect(getByText("Existing entity type relationships.")).toBeInTheDocument();

    userEvent.click(getByText("No"));
    expect(toggleModal).toBeCalledTimes(1);

    userEvent.click(getByText("Yes"));
    expect(confirmAction).toBeCalledTimes(1);
  });

  test("can render delete type step warn confirmation", () => {
    let entityName = "PersonXML";
    let stepValues = ["Person-Mapping-XML"];
    let toggleModal = jest.fn();
    let confirmAction = jest.fn();

    const {queryByText, queryByLabelText, getByText, getAllByText, rerender, getByLabelText} =  render(
      <ConfirmationModal
        isVisible={false}
        type={ConfirmationType.DeleteEntityStepWarn}
        boldTextArray={[entityName]}
        arrayValues={stepValues}
        toggleModal={toggleModal}
        confirmAction={confirmAction}
      />
    );

    expect(queryByLabelText("delete-step-text")).toBeNull();

    rerender(<ConfirmationModal
      isVisible={true}
      type={ConfirmationType.DeleteEntityStepWarn}
      boldTextArray={[entityName]}
      arrayValues={stepValues}
      toggleModal={toggleModal}
      confirmAction={confirmAction}
    />);

    expect(getAllByText(entityName)).toHaveLength(1);
    expect(getByText("Entity type is used in one or more steps.")).toBeInTheDocument();
    expect(getByText("Show Steps...")).toBeInTheDocument();
    expect(queryByText("Hide Steps...")).toBeNull();

    userEvent.click(getByLabelText("toggle-steps"));
    expect(getByText("Hide Steps...")).toBeInTheDocument();
    expect(queryByText("Show Steps...")).toBeNull();
    expect(getByText(stepValues[0])).toBeInTheDocument();

    userEvent.click(getByLabelText("toggle-steps"));
    expect(getByText("Show Steps...")).toBeInTheDocument();
    expect(queryByText("Hide Steps...")).toBeNull();

    userEvent.click(getByText("Close"));
    expect(toggleModal).toBeCalledTimes(1);
  });

  test("can render publish entity types confirmation", () => {
    let toggleModal = jest.fn();
    let confirmAction = jest.fn();

    const {queryByLabelText, getByText, rerender} =  render(
      <ConfirmationModal
        isVisible={false}
        type={ConfirmationType.PublishAll}
        boldTextArray={[]}
        toggleModal={toggleModal}
        confirmAction={confirmAction}
      />
    );

    expect(queryByLabelText("save-all-text")).toBeNull();

    rerender(<ConfirmationModal
      isVisible={true}
      type={ConfirmationType.PublishAll}
      boldTextArray={[]}
      toggleModal={toggleModal}
      confirmAction={confirmAction}
    />);

    expect(getByText("Are you sure you want to publish your changes to the entity model?")).toBeInTheDocument();

    userEvent.click(getByText("No"));
    expect(toggleModal).toBeCalledTimes(1);

    userEvent.click(getByText("Yes"));
    expect(confirmAction).toBeCalledTimes(1);
  });

  test("can render navigation away confirmation", () => {
    let toggleModal = jest.fn();
    let confirmAction = jest.fn();

    const {queryByLabelText, getByText, rerender} =  render(
      <ConfirmationModal
        isVisible={false}
        type={ConfirmationType.NavigationWarn}
        boldTextArray={[]}
        toggleModal={toggleModal}
        confirmAction={confirmAction}
      />
    );

    expect(queryByLabelText("navigation-warn-text")).toBeNull();

    rerender(<ConfirmationModal
      isVisible={true}
      type={ConfirmationType.NavigationWarn}
      boldTextArray={[]}
      toggleModal={toggleModal}
      confirmAction={confirmAction}
    />);

    expect(getByText("Unpublished Changes")).toBeInTheDocument();
    expect(getByText("You have made changes to the properties of one or more entity types. If you leave the screen without publishing your changes, they will not be available in the rest of Hub Central.")).toBeInTheDocument();

    userEvent.click(getByText("No"));
    expect(toggleModal).toBeCalledTimes(1);

    userEvent.click(getByText("Yes"));
    expect(confirmAction).toBeCalledTimes(1);
  });

  test("can render add step to flow confirmation", () => {
    let boldTextArray = ["match-customer", "customer-flow"];
    let toggleModal = jest.fn();
    let confirmAction = jest.fn();

    const {queryByLabelText, getByText, rerender, getByLabelText} =  render(
      <ConfirmationModal
        isVisible={false}
        type={ConfirmationType.AddStepToFlow}
        boldTextArray={boldTextArray}
        toggleModal={toggleModal}
        confirmAction={confirmAction}
      />
    );

    expect(queryByLabelText("add-step-to-flow-text")).toBeNull();

    rerender(<ConfirmationModal
      isVisible={true}
      type={ConfirmationType.AddStepToFlow}
      boldTextArray={boldTextArray}
      toggleModal={toggleModal}
      confirmAction={confirmAction}
    />);

    expect(getByLabelText("add-step-to-flow-text")).toBeInTheDocument();
    expect(getByText(boldTextArray[0])).toBeInTheDocument();
    expect(getByText(boldTextArray[1])).toBeInTheDocument();

    userEvent.click(getByText("No"));
    expect(toggleModal).toBeCalledTimes(1);

    userEvent.click(getByText("Yes"));
    expect(confirmAction).toBeCalledTimes(1);
  });

  test("can render discard change confirmation", () => {
    let toggleModal = jest.fn();
    let confirmAction = jest.fn();

    const {queryByLabelText, getByText, rerender} =  render(
      <ConfirmationModal
        isVisible={false}
        type={ConfirmationType.DiscardChanges}
        boldTextArray={[]}
        toggleModal={toggleModal}
        confirmAction={confirmAction}
      />
    );

    expect(queryByLabelText("discard-changes-text")).toBeNull();

    rerender(<ConfirmationModal
      isVisible={true}
      type={ConfirmationType.DiscardChanges}
      boldTextArray={[]}
      toggleModal={toggleModal}
      confirmAction={confirmAction}
    />);

    expect(getByText("Discard Changes?")).toBeInTheDocument();

    userEvent.click(getByText("No"));
    expect(toggleModal).toBeCalledTimes(1);

    userEvent.click(getByText("Yes"));
    expect(confirmAction).toBeCalledTimes(1);
  });
});

