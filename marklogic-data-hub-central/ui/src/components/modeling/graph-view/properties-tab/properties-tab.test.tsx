import React from "react";
import {BrowserRouter as Router} from "react-router-dom";
import {render, fireEvent} from "@testing-library/react";
import PropertiesTab from "./properties-tab";

import {
  getEntityTypes,
} from "../../../../assets/mock-data/modeling/modeling";

describe("Graph Modeling Properties Tab Component", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Verify Show/Hide Legend functionality", () => {
    const {getByTestId, queryByTestId} =  render(
      <Router>
        <PropertiesTab
          entityTypeData={getEntityTypes[0]}
          canWriteEntityModel={true}
          canReadEntityModel={true}
        />
      </Router>);

    //Legend should be hidden by default with "Show Legend >>" link visible
    expect(getByTestId("showLegendLink")).toBeInTheDocument();

    expect(queryByTestId("foreignKeyIconLegend")).not.toBeInTheDocument();
    expect(queryByTestId("multipleIconLegend")).not.toBeInTheDocument();
    expect(queryByTestId("structuredIconLegend")).not.toBeInTheDocument();
    expect(queryByTestId("hideLegendLink")).not.toBeInTheDocument();

    //toggle link to show legend
    fireEvent.click(getByTestId("showLegendLink"));
    expect(getByTestId("hideLegendLink")).toBeInTheDocument();
    expect(queryByTestId("showLegendLink")).not.toBeInTheDocument();

    expect(getByTestId("foreignKeyIconLegend")).toBeInTheDocument();
    expect(getByTestId("multipleIconLegend")).toBeInTheDocument();
    expect(getByTestId("structuredIconLegend")).toBeInTheDocument();
    expect(getByTestId("hideLegendLink")).toBeInTheDocument();

  });
});