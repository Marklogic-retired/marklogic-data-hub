import React from "react";
import {render, screen, cleanup} from "@testing-library/react";
import {FilePerson, ArrowLeftCircleFill} from "react-bootstrap-icons";
import {fireEvent} from "@testing-library/react";
import HCSearch from "./hc-search";

afterEach(() => {
  cleanup();
});

test("should render a HCSearch component", () => {
  render(<HCSearch placeholder={"Search"}></HCSearch>);
  const inputElement = screen.getByTestId("hc-inputSearch-component");
  expect(inputElement).toBeInTheDocument();
});

test("should render a HCSearch component with size and value", () => {
  render(<HCSearch placeholder={"Search"} size={"sm"} value={"test"}></HCSearch>);
  const inputElement = screen.getByTestId("hc-inputSearch-component");
  expect(inputElement).toBeInTheDocument();
});

test("should render a HCSearch component with addon before", () => {
  render(<HCSearch addonBefore={"Addon Before"} placeholder={"Search"}></HCSearch>);
  const inputElement = screen.getByTestId("hc-inputSearch-component");
  const inputAddonElement = screen.getByTestId("hc-input-addonBefore");
  expect(inputElement).toBeInTheDocument();
  expect(inputAddonElement).toBeInTheDocument();
});

test("should render a HCSearch component with addon before and prefix", () => {
  render(<HCSearch addonBefore={"Addon Before"} prefix={<FilePerson />} placeholder={"Search"}></HCSearch>);
  const inputElement = screen.getByTestId("hc-inputSearch-component");
  const inputAddonElement = screen.getByTestId("hc-input-addonBefore");
  expect(inputElement).toBeInTheDocument();
  expect(inputAddonElement).toBeInTheDocument();
});

test("should render a HCSearch component with addon before, prefix and suffix", () => {
  render(<HCSearch addonBefore={"Addon Before"} prefix={<FilePerson />} suffix={<ArrowLeftCircleFill />} placeholder={"Search"}></HCSearch>);
  const inputElement = screen.getByTestId("hc-inputSearch-component");
  const inputAddonElement = screen.getByTestId("hc-input-addonBefore");
  const inputSuffixElement = screen.getByTestId("hc-input-suffix");
  expect(inputElement).toBeInTheDocument();
  expect(inputAddonElement).toBeInTheDocument();
  expect(inputSuffixElement).toBeInTheDocument();
});

test("should render a HCSearch component with addon before, prefix, suffix and allow clear", () => {
  render(<HCSearch addonBefore={"Addon Before"} prefix={<FilePerson />} suffix={<ArrowLeftCircleFill />} allowClear placeholder={"Search"}></HCSearch>);
  const inputElement = screen.getByTestId("hc-inputSearch-component");
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

test("should click the HCSearch component after click clean icon", () => {
  render(<HCSearch allowClear placeholder={"Search"} onSearch={() => {}}></HCSearch>);
  const inputElement = screen.getByTestId("hc-inputSearch-component");
  fireEvent.change(inputElement, {target: {value: "test"}});
  expect(inputElement["value"]).toBe("test");
  const cleanIconInputElement = screen.getByTestId("hc-input-allowClear");
  cleanIconInputElement.onclick = jest.fn();
  fireEvent.click(cleanIconInputElement);
  expect(cleanIconInputElement.onclick).toHaveBeenCalledTimes(1);
});

test("should click the HCSearch component with error and label", () => {
  render(<HCSearch allowClear placeholder={"Search"} onSearch={() => {}} error errorMessage={"You have an error, please check the content"}></HCSearch>);
  const inputElement = screen.getByTestId("hc-inputSearch-component");
  fireEvent.change(inputElement, {target: {value: "test"}});
  expect(inputElement["value"]).toBe("test");
  const cleanIconInputElement = screen.getByTestId("hc-input-allowClear");
  cleanIconInputElement.onclick = jest.fn();
  fireEvent.click(cleanIconInputElement);
  expect(cleanIconInputElement.onclick).toHaveBeenCalledTimes(1);
});