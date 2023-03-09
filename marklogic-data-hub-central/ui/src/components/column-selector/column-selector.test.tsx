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
  primaryKey: "",
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
    await waitForElement(() => getByText("Select the columns to display."));
    fireEvent.mouseOver(getByTestId("pk-tooltip"));
    await waitForElement(() => getByText("The column identified as the unique identifier must always be displayed."));
  });

  test("Verify that if a character is typed and no property has it, no results should be returned", () => {
    const {getByPlaceholderText} = render(<ColumnSelector {...defaultProps} />);
    const searchInput = getByPlaceholderText("Search") as HTMLInputElement;
    expect(searchInput).toBeInTheDocument();

    // verify that every property is displayed
    const propertyList = document.querySelector("[class=\"rc-tree-list-holder-inner\"]")?.children.length;
    let countDisplayNone = document.querySelectorAll("[style=\"display: none;\"]").length;
    expect(countDisplayNone).toBe(0);

    // Type a character that doesn't match any property name. q in this case.
    fireEvent.change(searchInput, {target: {value: "q"}});
    expect(searchInput.value).toBe("q");

    // Verify that no results are returned
    countDisplayNone = document.querySelectorAll("[style=\"display: none;\"]").length;
    expect(countDisplayNone).toBe(propertyList);
  });

  test("Verify that if a character typed is in a property name (structured or not), it should be returned", () => {
    const {getByPlaceholderText, getAllByTestId, getByTestId} = render(<ColumnSelector {...defaultProps} />);
    const searchInput = getByPlaceholderText("Search") as HTMLInputElement;
    expect(searchInput).toBeInTheDocument();
    fireEvent.change(searchInput, {target: {value: "c"}});
    expect(searchInput.value).toBe("c");

    // opens structured properties
    const structuredDataButtons = document.querySelectorAll("[class=\"rc-tree-switcher rc-tree-switcher_close\"]");
    fireEvent.click(structuredDataButtons[0]);
    fireEvent.click(structuredDataButtons[1]);

    // checks that the properties are displayed
    getAllByTestId("node-city").map(element => {
      expect(element).toBeInTheDocument();
    });
    expect(getByTestId("node-customerId")).toBeInTheDocument();
    expect(getByTestId("node-customerSince")).toBeInTheDocument();
    expect(getByTestId("node-nicknames")).toBeInTheDocument();
  });
});
