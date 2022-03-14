import {fireEvent, render} from "@testing-library/react";
import Pagination from "./Pagination";

describe("Pagination component", () => {
  test("Verify pagination component render correctly", () => {
    const {getByText, getByTestId} = render(
      <Pagination pageNumber={1} pageLength={10} setPageNumber={() => { }} total={100} pageLengths={[10, 20, 80, 100]} setPageLength={() => { }} />
    )
    expect(getByTestId("pagination")).toBeInTheDocument();
    expect(getByText("1")).toBeInTheDocument();
    expect(getByText("…")).toBeInTheDocument();
    expect(getByText("10")).toBeInTheDocument();
    expect(getByText("10 / page")).toBeInTheDocument();
  })
  test("Verify pagination callbacks are called", () => {
    const handleOnChange = jest.fn();
    const handleClick = jest.fn()
    const {getByText, getByTestId} = render(
      <Pagination pageNumber={1} pageLength={10} setPageNumber={handleClick} total={100} pageLengths={[10, 20, 80, 100]} setPageLength={handleOnChange} />
    )
    expect(getByTestId("pagination-component")).toBeInTheDocument();
    expect(getByTestId("pageSizeSelect")).toBeInTheDocument();
    fireEvent.click(getByText("2"))
    expect(handleClick).toHaveBeenCalledTimes(1)
    fireEvent.change(getByTestId("pageSizeSelect"), {target: {value: 20}})
    expect(handleOnChange).toHaveBeenCalledTimes(1)
  })
});