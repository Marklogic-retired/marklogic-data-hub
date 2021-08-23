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
  const {getByText, getByPlaceholderText} = render(<MonitorSidebar
    facets={{}}
    facetRender = {jest.fn()}
    checkFacetRender = {jest.fn()}
  />
  );

  expect(getByText("select time")).toBeInTheDocument();
  fireEvent.click(getByText("select time"));
  expect(getByText("Custom")).toBeInTheDocument();
  expect(getByText("Today")).toBeInTheDocument();
  expect(getByText("This Week")).toBeInTheDocument();
  fireEvent.click(getByText("Custom"));
  expect(getByPlaceholderText("Start date ~ End date")).toBeInTheDocument();
});
