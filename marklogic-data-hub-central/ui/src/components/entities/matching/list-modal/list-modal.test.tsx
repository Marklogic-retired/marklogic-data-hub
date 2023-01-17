import {fireEvent} from "@testing-library/dom";
import {cleanup, render, screen} from "@testing-library/react";
import React from "react";
import ListModal from "./list-modal";

describe("Test input validation values to ignore", () => {
  beforeEach(() => {
    cleanup();
  });
  it("Show error Messages when fields are empty ", async() => {
    render(<ListModal
      isVisible={true}
      toggleModal={() => {}}
      action={"A"}
      confirmAction={() => {}}
      checkIfExistInList={() => { return false; }}
      updateListValues={() => {}}
      listValues={[]}
    />);

    expect(screen.queryAllByText("A title for this list is required.")).toHaveLength(0);
    expect(screen.queryAllByText("Values to ignore in this list are required.")).toHaveLength(0);

    fireEvent.click(screen.getByLabelText("confirm-list-ignore"));
    expect(await screen.findAllByText("A title for this list is required.")).toHaveLength(1);
    expect(await screen.findAllByText("Values to ignore in this list are required.")).toHaveLength(1);

    fireEvent.mouseOver(screen.getByLabelText("icon: question-circle"));
    expect(await screen.findAllByText("Documents containing these values will be ignored during matching.")).toHaveLength(1);

  });

  it("Verify that the user don't put duplicate values", async () => {
    global.document.createRange = () => ({
      setStart: () => {},
      setEnd: () => {},
      commonAncestorContainer: {
        nodeName: "BODY",
        ownerDocument: document,
      },
    });
    render(<ListModal
      isVisible={true}
      toggleModal={() => {}}
      action={"A"}
      confirmAction={() => {}}
      checkIfExistInList={() => { return false; }}
      updateListValues={() => {}}
      listValues={["One"]}
    />);
    expect(screen.queryAllByText("Duplicated values is not allowed")).toHaveLength(0);
    const inputListValues =screen.getByPlaceholderText("Enter values to remove");
    fireEvent.change(inputListValues, {target: {value: "abcd"}});
    fireEvent.click(screen.getByRole("option"));
    fireEvent.change(inputListValues, {target: {value: "abcd"}});
    fireEvent.click(screen.getByRole("option"));
    expect(screen.queryAllByText("Duplicated values is not allowed")).toHaveLength(1);
  });

  it("Don't allow List Name duplicated", () => {
    render(<ListModal
      isVisible={true}
      toggleModal={() => {}}
      action={"A"}
      confirmAction={() => {}}
      checkIfExistInList={() => { return true; }}
      updateListValues={() => {}}
      listValues={["One"]}
    />);
    expect(screen.queryAllByText("This list name already exists.")).toHaveLength(0);
    const inputListName =screen.getByPlaceholderText("Enter title");
    fireEvent.change(inputListName, {target: {value: "abcd"}});
    fireEvent.click(screen.getByLabelText("confirm-list-ignore"));
    expect(screen.queryAllByText("This list name already exists.")).toHaveLength(1);
  });
});