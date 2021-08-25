import React from "react";
import {fireEvent, render, act} from "@testing-library/react";
import HCTooltip from "./hc-tooltip";

describe("Tooltip component", () => {

  test("should render a HCTooltip component ", async () => {
    let getByText;
    await act(async() => {
      const baseDom = render(<HCTooltip text="This is a tooltip" id="testing-tooltip" placement="left"><button data-testid="testing-button">TESTING</button></HCTooltip>);
      getByText = baseDom.getByText;
      fireEvent.mouseOver(baseDom.getByTestId("testing-button"));
    });

    expect(getByText("This is a tooltip")).toBeInTheDocument();
  });
});

