import React from "react";
import {render, fireEvent} from "@testing-library/react";
import CustomPageHeader from "./page-header";

describe("Page Header component tests", () => {
  const handleOnBackMock = jest.fn();

  test("Verify the title displays", () => {
    render(<CustomPageHeader title={"mapCustomersJSON"} handleOnBack={handleOnBackMock} />);
    expect(document.querySelector(".header-heading-title")).toHaveTextContent("mapCustomersJSON");
  });

  test("Verify handleOnBack is called on click", () => {
    const {getByLabelText} = render(<CustomPageHeader title={"mapCustomersJSON"} handleOnBack={handleOnBackMock} />);
    fireEvent.click(getByLabelText("Back"));
    expect(handleOnBackMock).toHaveBeenCalledTimes(1);
  });

});