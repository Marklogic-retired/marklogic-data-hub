import {cleanup, render} from "@testing-library/react";
import React from "react";
import HCCard from "./hc-card";


describe("Hub Central Card component", () => {

  afterEach(() => {
    cleanup();

  });

  test("should render a HCCard component ", () => {
    const {getByText} = render(<HCCard>This is a card</HCCard>);
    expect(getByText("This is a card")).toBeInTheDocument();
  });

  test("should render a HCCard component with actions", () => {
    const {getByText} = render(<HCCard
      actions={[
        <div>Action 1</div>, <div>Action 2</div>, <div>Action 3</div>
      ]}
    >This is a card</HCCard>);
    expect(getByText("This is a card")).toBeInTheDocument();
    expect(getByText("Action 1")).toBeInTheDocument();
    expect(getByText("Action 2")).toBeInTheDocument();
    expect(getByText("Action 3")).toBeInTheDocument();
  });

  test("should render a HCCard component with title extras", () => {
    const {getByText} = render(<HCCard
      title={"This is the title"}
      titleExtra={[
        <div key="extra">Extras here.</div>
      ]}
    >This is a card</HCCard>);
    expect(getByText("This is a card")).toBeInTheDocument();
    expect(getByText("Extras here.")).toBeInTheDocument();
  });

});