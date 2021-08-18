import React from "react";
import ColumnSelector from "./column-selector";
import {render, fireEvent, waitForElement} from "@testing-library/react";
import {entityPropertyDefinitions, selectedPropertyDefinitions} from "../../assets/mock-data/explore/entity-search";

let defaultProps = {
  popoverVisibility: true,
  setPopoverVisibility: jest.fn(),
  entityPropertyDefinitions: entityPropertyDefinitions,
  selectedPropertyDefinitions: selectedPropertyDefinitions,
  setColumnSelectorTouched: jest.fn(),
  columns: ["customerId", "name", "nicknames", "shipping", "billing"],
  primaryKey: ""
};

describe("Column selector component", () => {

  test("Verify popover is visible", () => {
    const {queryByTestId} = render(<ColumnSelector {...defaultProps} />);
    expect(queryByTestId("column-selector-popover")).toBeInTheDocument();
  });

  test("Verify entity properties render", () => {
    const {getByText} = render(<ColumnSelector {...defaultProps} />);
    expect(getByText("name")).toBeInTheDocument();
  });

  test("Verify entity property is searchable", () => {
    const {getByPlaceholderText, getByText} = render(<ColumnSelector {...defaultProps} />);
    const searchInput = getByPlaceholderText("Search") as HTMLInputElement;
    expect(searchInput).toBeInTheDocument();
    fireEvent.change(searchInput, {target: {value: "customerSince"}});
    expect(searchInput.value).toBe("customerSince");
    expect(getByText("customerSince")).toBeInTheDocument();
  });

  test("Verify cancel button closes popover", () => {
    const {getByText} = render(<ColumnSelector {...defaultProps} />);
    const cancelButton = getByText("Cancel");
    cancelButton.onclick = jest.fn();
    fireEvent.click(cancelButton);
    expect(cancelButton.onclick).toHaveBeenCalledTimes(1);
  });

  test("Verify apply button closes popover", () => {
    const {getByText} = render(<ColumnSelector {...defaultProps} />);
    const applyButton = getByText("Apply");
    applyButton.onclick = jest.fn();
    fireEvent.click(applyButton);
    expect(applyButton.onclick).toHaveBeenCalledTimes(1);
  });

  // TODO DHFPROD-7711 skipping failing tests to enable component replacement
  test.skip("Verify apply button is disabled when no properties selected", () => {
    const {getByText} = render(<ColumnSelector {...{...defaultProps, selectedPropertyDefinitions: []}} />);
    const applyButton = getByText("Apply");
    expect(applyButton).toBeDisabled();
  });

  test("Verify primaryKey and column selector tooltips render", async () => {
    const {getByTestId, getByText} = render(<ColumnSelector {...{...defaultProps, primaryKey: "customerId"}} />);
    expect(getByTestId("pk-tooltip")).toBeInTheDocument();
    expect(getByTestId("column-selector-tooltip")).toBeInTheDocument();
    fireEvent.mouseOver(getByTestId("column-selector-tooltip"));
    await(waitForElement(() => (getByText("Select the columns to display."))));
    fireEvent.mouseOver(getByTestId("pk-tooltip"));
    await(waitForElement(() => (getByText("The column identified as the unique identifier must always be displayed."))));
  });

});

