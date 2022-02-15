import React from "react";
import {fireEvent, render, waitFor} from "@testing-library/react";
import QueryExport from "./query-export";

describe("Query Export Component", () => {

  test("Verify query export icon tooltip", async () => {
    const {getByTestId, getByText} = render(<QueryExport />);
    expect(getByTestId("query-export")).toBeInTheDocument();
    fireEvent.mouseOver(getByTestId("query-export"));
    await(waitFor(() => (getByText("Export results with the displayed columns to CSV."))));
  });

});