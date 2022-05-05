import {render} from "@testing-library/react";
import Value from "./Value";

describe("Value component", () => {
  it("Verify Value received properties correctly", () => {
    const {getByText, getByTestId} = render(<Value style={{color: "#c2c2c2"}} className="testClass">test value</Value>)
    expect(getByTestId("valueId")).toBeInTheDocument();
    expect(getByText("test value")).toBeInTheDocument();
    expect(getByTestId("valueId")).toHaveStyle(`color: #c2c2c2`);
    expect(getByTestId("valueId")).toHaveClass("testClass");
  });
});