import React from "react";
import {render, screen, cleanup} from "@testing-library/react";
import HCButton from "./hc-button";


afterEach(() => {
  cleanup();
});


test("should render a HCButton component ", () => {
  render(<HCButton>click me</HCButton>);
  const buttonElement = screen.getByTestId("hc-button-component");
  expect(buttonElement).toBeInTheDocument();
  expect(buttonElement).toHaveTextContent("click me");
});
test("should render a spinner  ", () => {
  render(<HCButton loading>click mek</HCButton>);
  const spinnerElement = screen.getByTestId("hc-button-component-spinner");
  expect(spinnerElement).toBeInTheDocument();
});