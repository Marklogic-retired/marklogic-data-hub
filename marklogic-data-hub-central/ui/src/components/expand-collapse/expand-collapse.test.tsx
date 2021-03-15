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
    expect(handleSelectionMock).toHaveBeenCalledTimes(1);
    expect(handleSelectionMock).toHaveBeenLastCalledWith("expand");

    fireEvent.click(collapseBtn);
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
});