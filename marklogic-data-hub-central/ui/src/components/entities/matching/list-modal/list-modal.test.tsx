import {fireEvent} from "@testing-library/dom";
import {cleanup, render, screen} from "@testing-library/react";
import {getSubElements} from "@util/test-utils";
import React from "react";
import ListModal from "./list-modal";

const errorText = "Names must start with a letter and can contain letters, numbers, hyphens, and underscores.";

describe("Test input validation values to ignore", () => {
  const globalAny:any = global;
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
    globalAny.document.createRange = () => ({
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
    const inputListValues =screen.getByPlaceholderText("Enter values to remove");
    fireEvent.change(inputListValues, {target: {value: "abcd"}});
    fireEvent.click(screen.getByRole("option"));
    fireEvent.change(inputListValues, {target: {value: "abcd"}});
    fireEvent.click(screen.getByRole("option"));
    expect(screen.getByText((content, node) => {
      return getSubElements(content, node, "The value abcd already exists in this list.");
    })).toBeInTheDocument();
  });

  it("Don't allow special characters on list of values", async () => {
    globalAny.document.createRange = () => ({
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
    expect(screen.queryAllByText(errorText)).toHaveLength(0);
    const inputListValues =screen.getByPlaceholderText("Enter values to remove");
    fireEvent.change(inputListValues, {target: {value: "ab$cd"}});
    fireEvent.click(screen.getByRole("option"));
    expect(screen.queryAllByText(errorText)).toHaveLength(1);
  });

  it("on list of values doesn't contain spaces", async () => {
    globalAny.document.createRange = () => ({
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
    expect(screen.queryAllByText(errorText)).toHaveLength(0);
    const inputListValues =screen.getByPlaceholderText("Enter values to remove");
    fireEvent.change(inputListValues, {target: {value: "ab cd"}});
    fireEvent.click(screen.getByRole("option"));
    expect(screen.queryAllByText(errorText)).toHaveLength(1);
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
    expect(screen.getByText((content, node) => {
      return getSubElements(content, node, "An existing list is already using the name abcd.");
    })).toBeInTheDocument();
  });

  it("Don't allow special characters on list name", () => {
    render(<ListModal
      isVisible={true}
      toggleModal={() => {}}
      action={"A"}
      confirmAction={() => {}}
      checkIfExistInList={() => { return false; }}
      updateListValues={() => {}}
      listValues={["One"]}
    />);
    expect(screen.queryAllByText(errorText)).toHaveLength(0);
    const inputListName =screen.getByPlaceholderText("Enter title");
    fireEvent.change(inputListName, {target: {value: "Listt$"}});
    fireEvent.click(screen.getByLabelText("confirm-list-ignore"));
    expect(screen.queryAllByText(errorText)).toHaveLength(1);
  });

  it("Name List Must start with a letter", () => {
    render(<ListModal
      isVisible={true}
      toggleModal={() => {}}
      action={"A"}
      confirmAction={() => {}}
      checkIfExistInList={() => { return false; }}
      updateListValues={() => {}}
      listValues={["One"]}
    />);
    const errorText = "Names must start with a letter and can contain letters, numbers, hyphens, and underscores.";
    expect(screen.queryAllByText(errorText)).toHaveLength(0);
    const inputListName =screen.getByPlaceholderText("Enter title");
    fireEvent.change(inputListName, {target: {value: "1List"}});
    fireEvent.click(screen.getByLabelText("confirm-list-ignore"));
    expect(screen.queryAllByText(errorText)).toHaveLength(1);
  });
});