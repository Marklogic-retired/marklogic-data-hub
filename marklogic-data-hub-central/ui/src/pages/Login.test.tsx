import React from "react";
import {shallow} from "enzyme";
import Login from "./Login";

describe("Login component", () => {
  it("should render correctly", () => {
    shallow(<Login />);
  });
});