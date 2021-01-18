import React from "react";
import {render, fireEvent, waitForElement, wait} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import CreateEditLoad from "./create-edit-load";
import {BrowserRouter} from "react-router-dom";
import {NewLoadTooltips} from "../../../config/tooltips.config";

describe("New/edit load step configuration", () => {

  const loadProps = {
    tabKey: "1",
    isEditing: true,
    openStepSettings: true,
    setOpenStepSettings: () => {},
    createLoadArtifact: () => {},
    stepData: {},
    canReadWrite: true,
    canReadOnly: false,
    currentTab: "1",
    setIsValid: () => {},
    resetTabs: () => {},
    setHasChanged: () => {},
    setPayload: () => {},
    onCancel: () => {}
  };

  test("fields non-Delimited Text render", async () => {
    const {baseElement, queryAllByText, getAllByLabelText, queryAllByPlaceholderText, getByText, getByLabelText} = render(<BrowserRouter>
      <CreateEditLoad {...loadProps} />
    </BrowserRouter>);
    expect(getByLabelText("newLoadCardTitle")).toBeInTheDocument();
    expect(queryAllByPlaceholderText("Enter name")[0]).toBeInTheDocument();
    expect(queryAllByPlaceholderText("Enter description")[0]).toBeInTheDocument();
    expect(baseElement.querySelector("#sourceFormat")).toBeInTheDocument();
    // Field separator and other separator shouldn't show unless it is csv and "Other" field separator
    expect(baseElement.querySelector("#fieldSeparator")).not.toBeInTheDocument();
    expect(baseElement.querySelector("#otherSeparator")).not.toBeInTheDocument();
    expect(baseElement.querySelector("#targetFormat")).toBeInTheDocument();
    expect(baseElement.querySelector("#outputUriPrefix")).toBeInTheDocument();
    expect(queryAllByPlaceholderText("Enter Source Name")[0]).toBeInTheDocument();
    expect(queryAllByPlaceholderText("Enter Source Type")[0]).toBeInTheDocument();
    expect(queryAllByText("Target URI Preview:").length).toEqual(0);
    expect(queryAllByPlaceholderText("Enter URI Prefix")[0]).toBeInTheDocument();
    let tooltip  = getAllByLabelText("icon: question-circle");

    // Tooltip for name
    fireEvent.mouseOver(tooltip[0]);
    await waitForElement(() => getByText(NewLoadTooltips.name));
    // Tooltip for Description
    fireEvent.mouseOver(tooltip[1]);
    await waitForElement(() => getByText(NewLoadTooltips.description));
    // Tooltip for Source Format
    fireEvent.mouseOver(tooltip[2]);
    await waitForElement(() => getByText(NewLoadTooltips.sourceFormat));
    // Tooltip for Target Format
    fireEvent.mouseOver(tooltip[3]);
    await waitForElement(() => getByText(NewLoadTooltips.targetFormat));
    fireEvent.mouseOver(tooltip[4]);
    await waitForElement(() => getByText(NewLoadTooltips.sourceName));
    fireEvent.mouseOver(tooltip[5]);
    await waitForElement(() => getByText(NewLoadTooltips.sourceType));
    // Tooltip for Target URI Prefix
    fireEvent.mouseOver(tooltip[6]);
    await waitForElement(() => getByText(NewLoadTooltips.outputURIPrefix));
    expect(getByText("Target Format:")).toHaveTextContent("Target Format: *");
    expect(getByText("Target URI Prefix:")).toHaveTextContent("Target URI Prefix:");
  });

  test("fields with Delimited Text render", async () => {
    const stepData = {sourceFormat: "csv", separator: "||", targetFormat: "json"};
    const {baseElement, queryAllByPlaceholderText, getByLabelText, getByText} = render(<BrowserRouter>
      <CreateEditLoad {...loadProps} stepData={stepData} />
    </BrowserRouter>);
    expect(getByLabelText("newLoadCardTitle")).toBeInTheDocument();
    expect(queryAllByPlaceholderText("Enter name")[0]).toBeInTheDocument();
    expect(queryAllByPlaceholderText("Enter description")[0]).toBeInTheDocument();
    expect(baseElement.querySelector("#sourceFormat")).toBeInTheDocument();
    // Field separator and other separator should show, since we've provided step data with Delimited Text and other separator
    expect(baseElement.querySelector("#fieldSeparator")).toBeInTheDocument();
    expect(baseElement.querySelector("#otherSeparator")).toBeInTheDocument();
    expect(baseElement.querySelector("#targetFormat")).toBeInTheDocument();
    expect(queryAllByPlaceholderText("Enter Source Name")[0]).toBeInTheDocument();
    expect(queryAllByPlaceholderText("Enter Source Type")[0]).toBeInTheDocument();
    expect(baseElement.querySelector("#outputUriReplacement")).not.toBeInTheDocument();
    expect(baseElement.querySelector("#outputUriPrefix")).toBeInTheDocument();

    // Tooltip for disabled name field
    fireEvent.mouseOver(queryAllByPlaceholderText("Enter name")[0]);
    await waitForElement(() => getByText(NewLoadTooltips.nameField));

  });

  test("targetFormat with Text should not display sourceName and sourceType", () => {
    const stepData = {sourceFormat: "csv", separator: "||", targetFormat: "txt"};
    const {baseElement, queryByText} = render(<BrowserRouter>
      <CreateEditLoad {...loadProps} stepData={stepData} />
    </BrowserRouter>);

    expect(baseElement.querySelector("#sourceFormat")).toBeInTheDocument();
    expect(baseElement.querySelector("#targetFormat")).toBeInTheDocument();
    expect(queryByText("Source Name")).not.toBeInTheDocument();
    expect(queryByText("Source Type")).not.toBeInTheDocument();
  });

  test("Verify name is required for form submission and error messaging appears as needed", async () => {
    const {queryByText, getByText, getByPlaceholderText} =
    render(<BrowserRouter><CreateEditLoad {...loadProps} isEditing={false} /></BrowserRouter>);
    const nameInput = getByPlaceholderText("Enter name");


    // error should not appear before anything is touched
    expect(queryByText("Name is required")).toBeNull();

    fireEvent.click(getByText("Save"));

    // message should appear when save button is clicked
    expect(queryByText("Name is required")).toBeInTheDocument();

    //error message should appear when name field does not lead with a letter
    fireEvent.change(nameInput, {target: {value: "123testLoadStep"}});
    expect(getByText("Names must start with a letter and can contain letters, numbers, hyphens, and underscores only.")).toBeInTheDocument();

    //reset name field
    fireEvent.change(nameInput, {target: {value: ""}});
    expect(getByText("Name is required")).toBeInTheDocument();

    //error message should appear when name field contains special characters
    fireEvent.change(nameInput, {target: {value: "testLoadStep$&*"}});
    expect(getByText("Names must start with a letter and can contain letters, numbers, hyphens, and underscores only.")).toBeInTheDocument();

    //enter in a valid name and verify error message disappears (test hyphen and underscores are allowed)
    fireEvent.change(nameInput, {target: {value: "test_Load_Step--"}});

    await wait(() => {
      expect(queryByText("Name is required")).toBeNull();
      expect(queryByText("Names must start with a letter and can contain letters, numbers, hyphens, and underscores only.")).toBeNull();
    });
  });

});