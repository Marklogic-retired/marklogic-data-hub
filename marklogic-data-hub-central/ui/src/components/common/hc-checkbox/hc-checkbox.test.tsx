import React from "react";
import {fireEvent, render, screen, cleanup} from "@testing-library/react";
import HCCheckbox from "./hc-checkbox";

afterEach(() => {
  cleanup();
});

test("should render a Checkbox component ", () => {
  const handleClick = (e) => {  };
  render(
    <HCCheckbox id="id-checkbox-component" handleClick={handleClick} value="checkbox value" label="Checkbox" dataTestId="checkbox-component"/>
  );
  const checkboxElement = screen.getByTestId("checkbox-component");
  expect(checkboxElement).toBeInTheDocument();
});

test("should check component ", async () => {
  const handleClick = (e) => {  };
  const {getByTestId} = render(
    <HCCheckbox id="id-checkbox-component" label="Checkbox" handleClick={handleClick} value="checkbox" dataTestId="checkbox-component"/>
  );
  let checkboxElement = getByTestId("checkbox-component") as HTMLInputElement;
  expect(checkboxElement).not.toBeChecked();
  fireEvent.click(checkboxElement);
  expect(checkboxElement).toBeChecked();
});