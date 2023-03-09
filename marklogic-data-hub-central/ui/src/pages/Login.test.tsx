import React from "react";
import Login from "./Login";
import {render} from "@testing-library/react";

describe("Login component", () => {
  it("should render correctly", () => {
    render(<Login />);
  });
});
