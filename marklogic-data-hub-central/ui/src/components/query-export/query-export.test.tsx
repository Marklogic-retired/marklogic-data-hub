import React from "react";
import {fireEvent, render, waitForElement} from "@testing-library/react";
import QueryExport from "./query-export";

describe("Query Export Component", () => {

  test("Verify query export icon tooltip", async () => {
    const {getByTestId, getByText} = render(<QueryExport />);
    expect(getByTestId("query-export")).toBeInTheDocument();
    fireEvent.mouseOver(getByTestId("query-export"));
    await(waitForElement(() => (getByText("Export results with the displayed columns to CSV."))));
  });

});