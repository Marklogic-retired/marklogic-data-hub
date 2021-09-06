
import React from "react";
import {render} from "@testing-library/react";
import HCSlider from "./hc-slider";

test("should render a HCSlider component ", async () => {
  const {getAllByRole, getByTestId} = render(<HCSlider minLimit={1} maxLimit={10} min={2} max={9}/>);
  expect(getByTestId("hc-slider-component")).toBeInTheDocument();
  const sliders = getAllByRole("slider");
  expect(sliders[0]).toHaveAttribute("aria-valuenow", "2");
  expect(sliders[1]).toHaveAttribute("aria-valuenow", "9");
});