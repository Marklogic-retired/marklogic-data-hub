import React from "react";
import {render, fireEvent, wait} from "@testing-library/react";
import ExpandCollapse from "./expand-collapse";

describe("Expand/Collapse component tests", () => {

  test("Verify handleSelection is called with correct option", () => {
    const handleSelectionMock = jest.fn();
    const {getByLabelText} = render(<ExpandCollapse handleSelection={handleSelectionMock} currentSelection={"collapse"}/>);

    let expandBtn = getByLabelText("radio-button-expand");
    let collapseBtn = getByLabelText("radio-button-collapse");

    fireEvent.click(expandBtn);
    expect(expandBtn).toBeChecked();
    expect(collapseBtn).not.toBeChecked();
    expect(handleSelectionMock).toHaveBeenCalledTimes(1);
    expect(handleSelectionMock).toHaveBeenLastCalledWith("expand");

    fireEvent.click(collapseBtn);
    expect(expandBtn).not.toBeChecked();
    expect(collapseBtn).toBeChecked();
    expect(handleSelectionMock).toHaveBeenCalledTimes(2);
    expect(handleSelectionMock).toHaveBeenLastCalledWith("collapse");
  });

  test("Verify Expand All/Collapse All tooltips appear when hovered", () => {
    const handleSelectionMock = jest.fn();
    const {getByLabelText, getByText} = render(<ExpandCollapse handleSelection={handleSelectionMock} currentSelection={"collapse"}/>);

    fireEvent.mouseOver(getByLabelText("radio-button-expand"));
    wait(() => expect(getByText("Expand All")));

    fireEvent.mouseOver(getByLabelText("radio-button-collapse"));
    wait(() => expect(getByText("Collapse All")));
  });

  test("Verify integrity of enter and arrow keys navigation", () => {
    const handleSelectionMock = jest.fn();
    const {getByLabelText} = render(<ExpandCollapse handleSelection={handleSelectionMock} currentSelection={"collapse"}/>);

    expect(getByLabelText("expand-collapse")).toBeInTheDocument();
    fireEvent.click(getByLabelText("radio-button-expand"));

    getByLabelText("expand-collapse").firstChild.focus();

    // verify default selection
    expect(getByLabelText("radio-button-expand")).toHaveProperty("checked", true);
    expect(getByLabelText("radio-button-collapse")).toHaveProperty("checked", false);

    // verify pressing enter switches expand to collapse
    fireEvent.keyDown(getByLabelText("expand-collapse"), {key: "Enter", code: "Enter"});
    expect(getByLabelText("radio-button-expand")).toHaveProperty("checked", false);
    expect(getByLabelText("radio-button-collapse")).toHaveProperty("checked", true);

    // verify pressing enter again switches collapse to expand
    fireEvent.keyDown(getByLabelText("expand-collapse"), {key: "Enter", code: "Enter"});
    expect(getByLabelText("radio-button-expand")).toHaveProperty("checked", true);
    expect(getByLabelText("radio-button-collapse")).toHaveProperty("checked", false);

    // verify pressing right arrow when on card switches expand to collapse
    fireEvent.keyDown(getByLabelText("expand-collapse"), {key: "ArrowRight", code: "ArrowRight"});
    expect(getByLabelText("radio-button-expand")).toHaveProperty("checked", false);
    expect(getByLabelText("radio-button-collapse")).toHaveProperty("checked", true);

    // verify pressing right arrow when on list does not switch view
    fireEvent.keyDown(getByLabelText("expand-collapse"), {key: "ArrowRight", code: "ArrowRight"});
    expect(getByLabelText("radio-button-collapse")).toHaveProperty("checked", true);

    // verify pressing left arrow when on list switches collapse to expand
    fireEvent.keyDown(getByLabelText("expand-collapse"), {key: "ArrowLeft", code: "ArrowLeft"});
    expect(getByLabelText("radio-button-expand")).toHaveProperty("checked", true);
    expect(getByLabelText("radio-button-collapse")).toHaveProperty("checked", false);

    // verify pressing left arrow when on card does not switch view
    fireEvent.keyDown(getByLabelText("expand-collapse"), {key: "ArrowLeft", code: "ArrowLeft"});
    expect(getByLabelText("radio-button-expand")).toHaveProperty("checked", true);
  });
});