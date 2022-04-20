import React from "react";
import {render, cleanup, fireEvent} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HCIconPicker from "./hc-icon-picker";

afterEach(() => {
  cleanup();
});

const props = {
  identifier: "Customer",
  icon: "FaShapes",
  onChange: jest.fn()
};

test("should render a HCIconPicker component", () => {
  const {getByTestId, queryByTestId} = render(<HCIconPicker value={props.icon} onChange={props.onChange} />);
  expect(getByTestId("default-hc-icon-picker-wrapper")).toBeInTheDocument();
  expect(getByTestId("default-FaShapes-icon-selected")).toBeInTheDocument();
  expect(queryByTestId("default-hc-icon-picker-input")).toBeNull();
  expect(queryByTestId("default-FaAndroid-icon-option")).toBeNull();
});

test("should render testid with personalized identifier", () => {
  const {getByTestId, queryByTestId} = render(<HCIconPicker identifier={props.identifier} value={props.icon} onChange={props.onChange} />);
  expect(getByTestId(`${props.identifier}-hc-icon-picker-wrapper`)).toBeInTheDocument();
  expect(getByTestId(`${props.identifier}-FaShapes-icon-selected`)).toBeInTheDocument();
  expect(queryByTestId(`${props.identifier}-hc-icon-picker-input`)).toBeNull();
  expect(queryByTestId(`${props.identifier}-FaAndroid-icon-option`)).toBeNull();
});

test("should render icon list with search input", () => {
  const {getByTestId} = render(<HCIconPicker identifier={props.identifier} value={props.icon} onChange={props.onChange} />);
  fireEvent.click(getByTestId(`${props.identifier}-hc-icon-picker-wrapper`));
  expect(getByTestId(`${props.identifier}-hc-icon-picker-list`)).toBeInTheDocument();
  expect(getByTestId(`${props.identifier}-hc-icon-picker-input`)).toBeInTheDocument();
  expect(getByTestId(`${props.identifier}-hc-icon-picker-list`).children.length).toBeGreaterThan(10);
});

test("should render icon list without search input", () => {
  const {getByTestId, queryByTestId} = render(<HCIconPicker identifier={props.identifier} value={props.icon} onChange={props.onChange} hideSearch={true} />);
  fireEvent.click(getByTestId(`${props.identifier}-hc-icon-picker-wrapper`));
  expect(getByTestId(`${props.identifier}-hc-icon-picker-list`)).toBeInTheDocument();
  expect(queryByTestId(`${props.identifier}-hc-icon-picker-input`)).toBeNull();
  expect(getByTestId(`${props.identifier}-hc-icon-picker-list`).children.length).toBeGreaterThan(10);
});

test("should filter the icon list when search in the input", () => {
  const {getByTestId} = render(<HCIconPicker identifier={props.identifier} value={props.icon} onChange={props.onChange} />);
  fireEvent.click(getByTestId(`${props.identifier}-hc-icon-picker-wrapper`));
  userEvent.type(getByTestId(`${props.identifier}-hc-icon-picker-input`), "instagram");
  expect(getByTestId(`${props.identifier}-hc-icon-picker-list`).children.length).toBe(3); //should have 3 childs input element and two instagram icons
});

test("can select a filtered icon and the list disapear on select", () => {
  const {getByTestId, queryByTestId} = render(<HCIconPicker identifier={props.identifier} value={props.icon} onChange={props.onChange} />);
  fireEvent.click(getByTestId(`${props.identifier}-hc-icon-picker-wrapper`));
  userEvent.type(getByTestId(`${props.identifier}-hc-icon-picker-input`), "android");
  fireEvent.click(getByTestId(`${props.identifier}-FaAndroid-icon-option`));
  expect(queryByTestId(`${props.identifier}-hc-icon-picker-list`)).toBeNull();
  expect(props.onChange).toHaveBeenCalledTimes(1);
});