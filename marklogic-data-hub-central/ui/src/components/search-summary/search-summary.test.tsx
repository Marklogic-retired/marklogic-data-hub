import React from "react";
import SearchSummary from "./search-summary";
import {render} from "@testing-library/react";

describe("Search Summary component", () => {
  test("render", async () => {
    const {getByTestId} = render(<SearchSummary total={100} start={1} length={10} pageSize={10} />);
    expect(getByTestId("total-documents")).toBeInTheDocument();
    expect(getByTestId("total-documents").textContent).toEqual("100");
  });
});
