import React from "react";
import {BrowserRouter as Router} from "react-router-dom";
import {render} from "@testing-library/react";
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

    //Legend should be visible

    expect(queryByTestId("relationshipIconLegend")).toBeInTheDocument();
    expect(getByTestId("foreignKeyIconLegend")).toBeInTheDocument();
    expect(getByTestId("multipleIconLegend")).toBeInTheDocument();
    expect(getByTestId("structuredIconLegend")).toBeInTheDocument();
  });
});