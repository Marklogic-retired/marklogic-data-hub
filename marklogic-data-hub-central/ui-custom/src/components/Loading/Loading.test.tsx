import {render} from "@testing-library/react";
import Loading from "./Loading";

describe("Loading component", () => {
  it("Verify Loading is rendered", () => {
   const {getByTestId,getByText}= render(<Loading/>)
   expect(getByTestId("loadingId")).toBeInTheDocument();
   expect(getByTestId("spinnerId")).toBeInTheDocument();
    expect(getByText("Loading...")).toBeInTheDocument();

 });
})