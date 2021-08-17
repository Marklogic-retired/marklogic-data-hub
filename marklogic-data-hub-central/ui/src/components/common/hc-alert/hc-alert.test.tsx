import React from "react";
import {render, screen, cleanup} from "@testing-library/react";
import HCAlert from "./hc-alert";

afterEach(() => {
  cleanup();

});

test("should render a HCAlert component ", () => {
  render(<HCAlert>This is an alert—check</HCAlert>);
  const alertElement = screen.getByTestId("hc-alert-component");
  expect(alertElement).toBeInTheDocument();
  expect(alertElement).toHaveTextContent("This is an alert—check");
});
test("should render a heading test  ", () => {
  render(<HCAlert heading="This is the heading">This is an alert—check</HCAlert>);
  const alertElement = screen.getByText("This is the heading");
  expect(alertElement).toBeInTheDocument();
});
test("default icon must be rendered", () => {
  render(<HCAlert variant="default" showIcon={true}>This is an alert—check</HCAlert>);
  const defaultIcon = screen.getByTestId("default-icon");
  expect(defaultIcon).toBeInTheDocument();
});
test("success icon must be rendered", () => {
  render(<HCAlert variant="success" showIcon={true}>This is an alert—check</HCAlert>);
  const successIcon = screen.getByTestId("success-icon");
  expect(successIcon).toBeInTheDocument();
});
test("info icon must be rendered", () => {
  render(<HCAlert variant="info" showIcon={true}>This is an alert—check</HCAlert>);
  const infoIcon = screen.getByTestId("info-icon");
  expect(infoIcon).toBeInTheDocument();
});
test("warning icon must be rendered", () => {
  render(<HCAlert variant="warning" showIcon={true}>This is an alert—check</HCAlert>);
  const warningIcon = screen.getByTestId("warning-icon");
  expect(warningIcon).toBeInTheDocument();
});
test("danger icon must be rendered", () => {
  render(<HCAlert variant="danger" showIcon={true}>This is an alert—check</HCAlert>);
  const dangerIcon = screen.getByTestId("danger-icon");
  expect(dangerIcon).toBeInTheDocument();
});