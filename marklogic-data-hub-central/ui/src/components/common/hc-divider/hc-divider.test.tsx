import React from "react";
import {render, screen, cleanup} from "@testing-library/react";
import styles from "../../../components/load/load-list.module.scss";
import HCDivider from "./hc-divider";

afterEach(() => {
  cleanup();
});

test("should render a Divider component ", () => {
  render(<HCDivider>This is a divider check</HCDivider>);
  const dividerElement = screen.getByTestId("divider-component");
  expect(dividerElement).toBeInTheDocument();
});

test("should render a vertical Divider component with styles", () => {
  render(<HCDivider type="vertical" style={{height: "55vh !important"}}>This is a vertical component divider with style</HCDivider>);
  const dividerElement = screen.getByTestId("divider-component");
  expect(dividerElement).toHaveStyle("height: 55vh !important");
  expect(dividerElement).toBeInTheDocument();
});

test("should render a vertical Divider component with a class", () => {
  render(<HCDivider type="vertical" className={styles.verticalDiv}>This is a vertical divider check with a class</HCDivider>);
  const dividerElement = screen.getByTestId("divider-component");
  expect(dividerElement).toContainHTML("verticalDiv");
  expect(dividerElement).toBeInTheDocument();
});

test("should render a horizontal Divider component dashed", () => {
  render(<HCDivider dashed={true}>This is a horizontal component divider dashed</HCDivider>);
  const dividerElement = screen.getByTestId("divider-component");
  expect(dividerElement).toBeInTheDocument();
});