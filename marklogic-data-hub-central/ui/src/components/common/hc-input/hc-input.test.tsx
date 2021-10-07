import React from "react";
import {render, screen, cleanup} from "@testing-library/react";
import {FilePerson, ArrowLeftCircleFill} from "react-bootstrap-icons";
import {fireEvent} from "@testing-library/react";
import HCInput from "./hc-input";

afterEach(() => {
  cleanup();
});

test("should render a HCInput component", () => {
  render(<HCInput placeholder={"Search"}></HCInput>);
  const inputElement = screen.getByTestId("hc-input-component");
  expect(inputElement).toBeInTheDocument();
});

test("should render a HCInput component with size and value", () => {
  render(<HCInput placeholder={"Search"} size={"sm"} value={"test"}></HCInput>);
  const inputElement = screen.getByTestId("hc-input-component");
  expect(inputElement).toBeInTheDocument();
});

test("should render a HCInput component with addon before", () => {
  render(<HCInput addonBefore={"Addon Before"} placeholder={"Search"}></HCInput>);
  const inputElement = screen.getByTestId("hc-input-component");
  const inputAddonElement = screen.getByTestId("hc-input-addonBefore");
  expect(inputElement).toBeInTheDocument();
  expect(inputAddonElement).toBeInTheDocument();
});

test("should render a HCInput component with addon before and prefix", () => {
  render(<HCInput addonBefore={"Addon Before"} prefix={<FilePerson />} placeholder={"Search"}></HCInput>);
  const inputElement = screen.getByTestId("hc-input-component");
  const inputAddonElement = screen.getByTestId("hc-input-addonBefore");
  expect(inputElement).toBeInTheDocument();
  expect(inputAddonElement).toBeInTheDocument();
});

test("should render a HCInput component with addon before, prefix and suffix", () => {
  render(<HCInput addonBefore={"Addon Before"} prefix={<FilePerson />} suffix={<ArrowLeftCircleFill />} placeholder={"Search"}></HCInput>);
  const inputElement = screen.getByTestId("hc-input-component");
  const inputAddonElement = screen.getByTestId("hc-input-addonBefore");
  const inputSuffixElement = screen.getByTestId("hc-input-suffix");
  expect(inputElement).toBeInTheDocument();
  expect(inputAddonElement).toBeInTheDocument();
  expect(inputSuffixElement).toBeInTheDocument();
});

test("should render a HCInput component with addon before, prefix, suffix and allow clear", () => {
  render(<HCInput addonBefore={"Addon Before"} prefix={<FilePerson />} suffix={<ArrowLeftCircleFill />} allowClear placeholder={"Search"}></HCInput>);
  const inputElement = screen.getByTestId("hc-input-component");
  fireEvent.change(inputElement, {target: {value: "test"}});
  expect(inputElement["value"]).toBe("test");
  const inputAddonElement = screen.getByTestId("hc-input-addonBefore");
  const inputAllowClearElement = screen.getByTestId("hc-input-allowClear");
  const inputSuffixElement = screen.getByTestId("hc-input-suffix");
  expect(inputElement).toBeInTheDocument();
  expect(inputAddonElement).toBeInTheDocument();
  expect(inputAllowClearElement).toBeInTheDocument();
  expect(inputSuffixElement).toBeInTheDocument();
});

test("should click a HCInput component after click clean icon", () => {
  render(<HCInput allowClear placeholder={"Search"}></HCInput>);
  const inputElement = screen.getByTestId("hc-input-component");
  fireEvent.change(inputElement, {target: {value: "test"}});
  expect(inputElement["value"]).toBe("test");
  const cleanIconInputElement = screen.getByTestId("hc-input-allowClear");
  cleanIconInputElement.onclick = jest.fn();
  fireEvent.click(cleanIconInputElement);
  expect(cleanIconInputElement.onclick).toHaveBeenCalledTimes(1);
});

test("should click a HCInput component with error and label", () => {
  render(<HCInput allowClear placeholder={"Search"} error errorMessage={"You have an error, please check the content"}></HCInput>);
  const inputElement = screen.getByTestId("hc-input-component");
  fireEvent.change(inputElement, {target: {value: "test"}});
  expect(inputElement["value"]).toBe("test");
  const cleanIconInputElement = screen.getByTestId("hc-input-allowClear");
  cleanIconInputElement.onclick = jest.fn();
  fireEvent.click(cleanIconInputElement);
  expect(cleanIconInputElement.onclick).toHaveBeenCalledTimes(1);
});