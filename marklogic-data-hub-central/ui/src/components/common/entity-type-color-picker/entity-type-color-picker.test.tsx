import React from "react";
import {fireEvent, render, cleanup} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";
import EntityTypeColorPicker from "./entity-type-color-picker";

const props = {
  entityType: "Customer",
  color: "#FFF0A3",
  handleColorChange: jest.fn(),
};

const newColor = "#C9EBC4";

describe("Entity type color picker", () => {

  afterEach(cleanup);

  test("Render entity type color picker menu", () => {
    const {getByLabelText, queryByLabelText} = render(<EntityTypeColorPicker {...props}/>);
    expect(getByLabelText(`${props.entityType}-color-button`)).toBeInTheDocument();
    expect(getByLabelText(`${props.entityType}-color-button`)).toHaveAttribute("data-color", props.color);
    expect(queryByLabelText(`${props.entityType}-color-picker-menu`)).toBeNull();
  });

  test("Open color choose a color and save", () => {
    const {getByLabelText, queryByLabelText, getByTitle} = render(<EntityTypeColorPicker entityType={props.entityType} color={props.color} handleColorChange={props.handleColorChange}/>);
    expect(getByLabelText(`${props.entityType}-color-button`)).toHaveAttribute("data-color", props.color);

    fireEvent.click(getByLabelText(`${props.entityType}-color-button`));
    expect(getByLabelText(`${props.entityType}-color-picker-menu`)).toBeVisible();
    //Select a color
    userEvent.click(getByTitle(newColor));
    //click outside color picker and check color picker popover it's closed
    fireEvent.click(document);
    expect(queryByLabelText(`${props.entityType}-color-picker-menu`)).toBeNull();
  });
});