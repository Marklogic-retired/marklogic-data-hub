import React from "react";
import {render} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";

import ErrorBoundary from "./ErrorBoundary";

describe("Error Boundary", () => {
  it("generates a error message when an error is caught", () => {
    const ThrowError = () => {
      throw new Error("Test");
    };
    const {getByTestId} = render(
      <MemoryRouter>
        <ErrorBoundary >
          <ThrowError />
        </ErrorBoundary>
      </MemoryRouter>
    );
    expect(getByTestId("errorScreen")).toBeVisible();

  });
});