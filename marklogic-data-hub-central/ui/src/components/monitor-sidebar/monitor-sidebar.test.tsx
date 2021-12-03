import React from "react";
import {render, fireEvent} from "@testing-library/react";
import MonitorSidebar from "./monitor-sidebar";



test("Verify Start Time dropdown is rendered", () => {
  const {getByText} = render(<MonitorSidebar
    facets={{}}
    facetRender = {jest.fn()}
    checkFacetRender = {jest.fn()}
  />);
  expect(getByText("Start Time")).toBeInTheDocument();
  expect(getByText("Select time")).toBeInTheDocument();
});

test("Verify Custom date picker is rendered", () => {
  const {getByText, getByPlaceholderText, getByLabelText} = render(<MonitorSidebar
    facets={{}}
    facetRender = {jest.fn()}
    checkFacetRender = {jest.fn()}
  />
  );

  expect(getByText("Select time")).toBeInTheDocument();
  fireEvent.keyDown(getByLabelText("date-select"), {key: "ArrowDown"});
  expect(getByText("Custom")).toBeInTheDocument();
  expect(getByText("Today")).toBeInTheDocument();
  expect(getByText("This Week")).toBeInTheDocument();
  fireEvent.click(getByText("Custom"));
  expect(getByPlaceholderText("Start date ~ End date")).toBeInTheDocument();
});
