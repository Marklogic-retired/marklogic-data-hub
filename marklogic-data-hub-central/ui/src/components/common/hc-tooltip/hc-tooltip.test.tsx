import React from "react";
import {fireEvent, render, act, screen} from "@testing-library/react";
import HCTooltip from "./hc-tooltip";

describe("Tooltip component", () => {

  test("should render a HCTooltip component ", async () => {

    await act(async() => {
      render(<HCTooltip text="This is a tooltip" id="testing-tooltip" placement="left"><button data-testid="testing-button">TESTING</button></HCTooltip>);
      fireEvent.mouseOver(screen.getByTestId("testing-button"));
    });

    expect(await screen.findAllByText("This is a tooltip")).toHaveLength(1);
  });
});

