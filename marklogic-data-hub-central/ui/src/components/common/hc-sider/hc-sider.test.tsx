import React from "react";
import {render, screen, cleanup} from "@testing-library/react";
import HCSider from "./hc-sider";

afterEach(() => {
  cleanup();
});


test("should render a Slider component ", () => {
  render(<HCSider placement="left" show={true}>This is an sider</HCSider>);
  const siderElement = screen.getByTestId("hc-sider-component");
  expect(siderElement).toBeInTheDocument();
  expect(siderElement).toHaveTextContent("This is an sider");
});
test("should render a footer inside the Slider component ", () => {
  render(<HCSider placement="left" show={true} footer={<span>The footer</span>}>This is an sider</HCSider>);
  const siderElement = screen.getByTestId("hc-sider-component");
  expect(siderElement).toBeInTheDocument();
  expect(siderElement).toHaveTextContent("The footer");
});
test("should not render a Slider component ", () => {
  render(<HCSider placement="left" show={false}>This is an sider</HCSider>);
  const content = screen.queryByText("This is an sider");
  expect(content).not.toBeInTheDocument();
});