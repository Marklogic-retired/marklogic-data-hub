import React from "react";
import {render} from "@testing-library/react";
import NoResponse from "./NoResponse";

describe("NoResponse component", () => {

  test("Verify static display", async () => {

    const {getByText, getByLabelText} = render(<NoResponse/>);

    expect(getByLabelText("noResponse")).toBeInTheDocument();

    expect(getByText("No response from MarkLogic Server.")).toBeInTheDocument();
    expect(getByText("Contact your administrator.")).toBeInTheDocument();

  });

});