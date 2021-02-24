import React from "react";
import {render, fireEvent, within} from "@testing-library/react";
import SourceNavigation from "./source-navigation";

describe("Source Navigation component tests", () => {

  test("Verify left navigation button is disabled when first document is selected", () => {
    const {getByLabelText, getByTestId} = render(<SourceNavigation currentIndex={0} startIndex={0} endIndex={2} handleSelection={jest.fn()} />);

    let uriIndex = within(getByLabelText("uriIndex"));
    let leftNavButton = getByTestId("navigate-uris-left");
    let rightNavButton = getByTestId("navigate-uris-right");

    expect(uriIndex.getByText("1")).toBeInTheDocument();
    expect(leftNavButton).toBeDisabled();
    expect(rightNavButton).toBeEnabled();

  });

  test("Verify right navigation button is disabled when last document is selected", () => {
    const {getByLabelText, getByTestId} = render(<SourceNavigation currentIndex={2} startIndex={0} endIndex={2} handleSelection={jest.fn()} />);

    let uriIndex = within(getByLabelText("uriIndex"));
    let leftNavButton = getByTestId("navigate-uris-left");
    let rightNavButton = getByTestId("navigate-uris-right");

    expect(uriIndex.getByText("3")).toBeInTheDocument();
    expect(leftNavButton).toBeEnabled();
    expect(rightNavButton).toBeDisabled();
  });

  test("Verify left and right navigation buttons are disabled when only one documet exists", () => {
    const {getByLabelText, getByTestId} = render(<SourceNavigation currentIndex={0} startIndex={0} endIndex={0} handleSelection={jest.fn()} />);

    let uriIndex = within(getByLabelText("uriIndex"));
    let leftNavButton = getByTestId("navigate-uris-left");
    let rightNavButton = getByTestId("navigate-uris-right");

    expect(uriIndex.getByText("1")).toBeInTheDocument();
    expect(leftNavButton).toBeDisabled();
    expect(rightNavButton).toBeDisabled();
  });

  test("Verify left and right navigation buttons are enabled when middle document is selected", () => {
    const {getByLabelText, getByTestId} = render(<SourceNavigation currentIndex={1} startIndex={0} endIndex={2} handleSelection={jest.fn()} />);

    let uriIndex = within(getByLabelText("uriIndex"));
    let leftNavButton = getByTestId("navigate-uris-left");
    let rightNavButton = getByTestId("navigate-uris-right");

    expect(uriIndex.getByText("2")).toBeInTheDocument();
    expect(leftNavButton).toBeEnabled();
    expect(rightNavButton).toBeEnabled();
  });

  test("Verify handleSelection is called with correct index", () => {
    const handleSelectionMock = jest.fn();
    const {getByTestId} = render(<SourceNavigation currentIndex={1} startIndex={0} endIndex={2} handleSelection={handleSelectionMock} />);

    fireEvent.click(getByTestId("navigate-uris-left"));
    expect(handleSelectionMock).toHaveBeenCalledTimes(1);
    expect(handleSelectionMock).toHaveBeenLastCalledWith(0);

    fireEvent.click(getByTestId("navigate-uris-right"));
    expect(handleSelectionMock).toHaveBeenCalledTimes(2);
    expect(handleSelectionMock).toHaveBeenLastCalledWith(2);
  });

});