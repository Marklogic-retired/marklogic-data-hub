import {fireEvent} from "@testing-library/dom";
import {cleanup, render, screen} from "@testing-library/react";
import {getSubElements} from "@util/test-utils";
import React from "react";
import ListModal from "./list-modal";

const errorTextNoTitle = "A title for this list is required.";
const errorTextNoValues = "Values to ignore in this list are required.";
const errorText = "Names must start with a letter or number and can contain letters, numbers, hyphens, and underscores.";

describe("Test input validation values to ignore", () => {
  const globalAny: any = global;
  beforeEach(() => {
    cleanup();
  });

  it("Show error Messages when fields are empty ", async () => {
    render(
      <ListModal
        isVisible={true}
        toggleModal={() => {}}
        action={"A"}
        confirmAction={() => {}}
        checkIfExistInList={() => {
          return false;
        }}
        updateListValues={() => {}}
        listValues={[]}
      />,
    );

    expect(screen.queryAllByText(errorTextNoTitle)).toHaveLength(0);
    expect(screen.queryAllByText(errorTextNoValues)).toHaveLength(0);

    fireEvent.click(screen.getByLabelText("confirm-list-ignore"));
    expect(await screen.findAllByText(errorTextNoTitle)).toHaveLength(1);
    expect(await screen.findAllByText(errorTextNoValues)).toHaveLength(1);

    fireEvent.mouseOver(screen.getByLabelText("icon: question-circle"));
    expect(
      await screen.findAllByText("Documents containing these values will be ignored during matching."),
    ).toHaveLength(1);
  });

  it("Don't allow duplicate values", async () => {
    globalAny.document.createRange = () => ({
      setStart: () => {},
      setEnd: () => {},
      commonAncestorContainer: {
        nodeName: "BODY",
        ownerDocument: document,
      },
    });
    render(
      <ListModal
        isVisible={true}
        toggleModal={() => {}}
        action={"A"}
        confirmAction={() => {}}
        checkIfExistInList={() => {
          return false;
        }}
        updateListValues={() => {}}
        listValues={["One"]}
      />,
    );
    const inputListValues = screen.getByPlaceholderText("Enter values to remove");
    fireEvent.change(inputListValues, {target: {value: "abcd"}});
    fireEvent.click(screen.getByRole("option"));
    fireEvent.change(inputListValues, {target: {value: "abcd"}});
    fireEvent.click(screen.getByRole("option"));
    expect(
      screen.getByText((content, node) => {
        return getSubElements(content, node, "The value abcd already exists in this list.");
      }),
    ).toBeInTheDocument();
  });

  it("Allow letters and numbers in the values", async () => {
    globalAny.document.createRange = () => ({
      setStart: () => {},
      setEnd: () => {},
      commonAncestorContainer: {
        nodeName: "BODY",
        ownerDocument: document,
      },
    });
    render(
      <ListModal
        isVisible={true}
        toggleModal={() => {}}
        action={"A"}
        confirmAction={() => {}}
        checkIfExistInList={() => {
          return false;
        }}
        updateListValues={() => {}}
        listValues={["One"]}
      />,
    );
    expect(screen.queryAllByText(errorText)).toHaveLength(0);
    const inputListValues = screen.getByPlaceholderText("Enter values to remove");
    fireEvent.change(inputListValues, {target: {value: "ab3d"}});
    fireEvent.click(screen.getByRole("option"));
    expect(screen.queryAllByText(errorText)).toHaveLength(0);
  });

  it("Allow hyphen characters in the values", async () => {
    globalAny.document.createRange = () => ({
      setStart: () => {},
      setEnd: () => {},
      commonAncestorContainer: {
        nodeName: "BODY",
        ownerDocument: document,
      },
    });
    render(
      <ListModal
        isVisible={true}
        toggleModal={() => {}}
        action={"A"}
        confirmAction={() => {}}
        checkIfExistInList={() => {
          return false;
        }}
        updateListValues={() => {}}
        listValues={["One"]}
      />,
    );
    expect(screen.queryAllByText(errorText)).toHaveLength(0);
    const inputListValues = screen.getByPlaceholderText("Enter values to remove");
    fireEvent.change(inputListValues, {target: {value: "ab-cd"}});
    fireEvent.click(screen.getByRole("option"));
    expect(screen.queryAllByText(errorText)).toHaveLength(0);
  });

  it("Allow underscore characters in the values", async () => {
    globalAny.document.createRange = () => ({
      setStart: () => {},
      setEnd: () => {},
      commonAncestorContainer: {
        nodeName: "BODY",
        ownerDocument: document,
      },
    });
    render(
      <ListModal
        isVisible={true}
        toggleModal={() => {}}
        action={"A"}
        confirmAction={() => {}}
        checkIfExistInList={() => {
          return false;
        }}
        updateListValues={() => {}}
        listValues={["One"]}
      />,
    );
    expect(screen.queryAllByText(errorText)).toHaveLength(0);
    const inputListValues = screen.getByPlaceholderText("Enter values to remove");
    fireEvent.change(inputListValues, {target: {value: "a_b_cd"}});
    fireEvent.click(screen.getByRole("option"));
    expect(screen.queryAllByText(errorText)).toHaveLength(0);
  });

  it("Don't allow special characters in the values", async () => {
    globalAny.document.createRange = () => ({
      setStart: () => {},
      setEnd: () => {},
      commonAncestorContainer: {
        nodeName: "BODY",
        ownerDocument: document,
      },
    });
    render(
      <ListModal
        isVisible={true}
        toggleModal={() => {}}
        action={"A"}
        confirmAction={() => {}}
        checkIfExistInList={() => {
          return false;
        }}
        updateListValues={() => {}}
        listValues={["One"]}
      />,
    );
    expect(screen.queryAllByText(errorText)).toHaveLength(0);
    const inputListValues = screen.getByPlaceholderText("Enter values to remove");
    fireEvent.change(inputListValues, {target: {value: "ab$cd"}});
    fireEvent.click(screen.getByRole("option"));
    expect(screen.queryAllByText(errorText)).toHaveLength(1);
    fireEvent.change(inputListValues, {target: {value: "ab>cd"}});
    fireEvent.click(screen.getByRole("option"));
    expect(screen.queryAllByText(errorText)).toHaveLength(1);
    fireEvent.change(inputListValues, {target: {value: "ab<cd"}});
    fireEvent.click(screen.getByRole("option"));
    expect(screen.queryAllByText(errorText)).toHaveLength(1);
  });

  it("Allow spaces in the values", async () => {
    globalAny.document.createRange = () => ({
      setStart: () => {},
      setEnd: () => {},
      commonAncestorContainer: {
        nodeName: "BODY",
        ownerDocument: document,
      },
    });
    render(
      <ListModal
        isVisible={true}
        toggleModal={() => {}}
        action={"A"}
        confirmAction={() => {}}
        checkIfExistInList={() => {
          return false;
        }}
        updateListValues={() => {}}
        listValues={["One"]}
      />,
    );
    expect(screen.queryAllByText(errorText)).toHaveLength(0);
    const inputListValues = screen.getByPlaceholderText("Enter values to remove");
    fireEvent.change(inputListValues, {target: {value: "ab cd"}});
    fireEvent.click(screen.getByRole("option"));
    expect(screen.queryAllByText(errorText)).toHaveLength(0);
  });

  it("Don't allow List Name duplicated", () => {
    render(
      <ListModal
        isVisible={true}
        toggleModal={() => {}}
        action={"A"}
        confirmAction={() => {}}
        checkIfExistInList={() => {
          return true;
        }}
        updateListValues={() => {}}
        listValues={["One"]}
      />,
    );
    expect(screen.queryAllByText("This list name already exists.")).toHaveLength(0);
    const inputListName = screen.getByPlaceholderText("Enter title");
    fireEvent.change(inputListName, {target: {value: "abcd"}});
    fireEvent.click(screen.getByLabelText("confirm-list-ignore"));
    expect(
      screen.getByText((content, node) => {
        return getSubElements(content, node, "An existing list is already using the name abcd.");
      }),
    ).toBeInTheDocument();
  });

  it("Don't allow special characters on list name", () => {
    render(
      <ListModal
        isVisible={true}
        toggleModal={() => {}}
        action={"A"}
        confirmAction={() => {}}
        checkIfExistInList={() => {
          return false;
        }}
        updateListValues={() => {}}
        listValues={["One"]}
      />,
    );
    expect(screen.queryAllByText(errorText)).toHaveLength(0);
    const inputListName = screen.getByPlaceholderText("Enter title");
    fireEvent.change(inputListName, {target: {value: "List$"}});
    fireEvent.click(screen.getByLabelText("confirm-list-ignore"));
    expect(screen.queryAllByText(errorText)).toHaveLength(1);
    fireEvent.change(inputListName, {target: {value: "List>"}});
    fireEvent.click(screen.getByLabelText("confirm-list-ignore"));
    expect(screen.queryAllByText(errorText)).toHaveLength(1);
  });

  it("Name List must start with a letter or number", () => {
    render(
      <ListModal
        isVisible={true}
        toggleModal={() => {}}
        action={"A"}
        confirmAction={() => {}}
        checkIfExistInList={() => {
          return false;
        }}
        updateListValues={() => {}}
        listValues={["One"]}
      />,
    );
    expect(screen.queryAllByText(errorText)).toHaveLength(0);
    const inputListName = screen.getByPlaceholderText("Enter title");
    fireEvent.change(inputListName, {target: {value: "$List"}});
    fireEvent.click(screen.getByLabelText("confirm-list-ignore"));
    expect(screen.queryAllByText(errorText)).toHaveLength(1);

    fireEvent.change(inputListName, {target: {value: "List"}});
    fireEvent.click(screen.getByLabelText("confirm-list-ignore"));
    expect(screen.queryAllByText(errorText)).toHaveLength(0);

    fireEvent.change(inputListName, {target: {value: "1List"}});
    fireEvent.click(screen.getByLabelText("confirm-list-ignore"));
    expect(screen.queryAllByText(errorText)).toHaveLength(0);
  });
});
