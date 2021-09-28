import React from "react";
import {render, screen, cleanup, fireEvent} from "@testing-library/react";
import HCDateTimePicker from "./hc-datetime-picker";

afterEach(() => {
  cleanup();
});

test("should render an HCDateTimePicker component ", () => {
  render(<HCDateTimePicker name="hc-datepicker-test" />);
  const datePickerElement = screen.getByTestId("hc-datepicker-test");
  expect(datePickerElement).toBeInTheDocument();
});
test("should render a default range picker  ", () => {
  render(<HCDateTimePicker name="hc-datepicker-test" />);
  const datePickerElement = screen.getByTestId("hc-datepicker-test");
  expect(datePickerElement).toBeInTheDocument();
});
test("should render a date and time range picker ", () => {
  const {getByPlaceholderText, getAllByText} = render(<HCDateTimePicker name="hc-datepicker-test" time={true} placeholder={["Start Date Time", "End Date Time"]} />);
  const datePickerElement = screen.getByTestId("hc-datepicker-test");
  expect(getByPlaceholderText("Start Date Time ~ End Date Time")).toBeInTheDocument();

  fireEvent.click(datePickerElement);
  let timeDropdownsContainer = getAllByText(
    (_content, element) => element?.className !== null && element?.className === "calendar-time");

  expect(timeDropdownsContainer).toHaveLength(2);
  expect(timeDropdownsContainer[0]).toBeInTheDocument();
});
test("should default start date to today's date  ", () => {
  const {getAllByText} = render(<HCDateTimePicker name="hc-datepicker-test" time={true} placeholder={["Start Date Time", "End Date Time"]} />);
  const datePickerElement = screen.getByTestId("hc-datepicker-test");
  fireEvent.click(datePickerElement);

  const activeDate = getAllByText((_content, element) => element?.classList !== null && element?.classList?.contains("active") || false);
  expect(activeDate.length).toBeGreaterThanOrEqual(1);
  expect(activeDate[0].className.includes("start-date")).toBe(true);
  expect(activeDate[0].textContent).toEqual(`${new Date().getDate()}`);
});