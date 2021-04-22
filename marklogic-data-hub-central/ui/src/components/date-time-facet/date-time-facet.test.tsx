import React from "react";
import {render} from "@testing-library/react";
import DateTimeFacet from "./date-time-facet";

describe("DateTime facet", () => {

  test("DateTime facet component renders without crashing", async () => {
    const {getByTestId} = render(<DateTimeFacet
      name={"date-facet"}
      constraint={"date-facet"}
      datatype={"date"}
      key={"0"}
      propertyPath={"date-facet"}
      onChange={jest.fn()}
    />);

    const dateFacet = getByTestId("facet-date-time-picker");
    expect(dateFacet).toBeInTheDocument();
    expect(dateFacet).toHaveTextContent("date-facet");
  });

  test("Can render with nested properties", async () => {
    const {getByTestId, getByText, queryByText} = render(<DateTimeFacet
      name={"Order.OrderDetail.DateTime"}
      constraint={"Order.OrderDetail.DateTime"}
      datatype={"dateTime"}
      propertyPath={"DateTime"}
      key={"0"}
      onChange={jest.fn()}
    />);

    const dateFacet = getByTestId("facet-date-time-picker");
    expect(dateFacet).toBeInTheDocument();

    expect(getByText(/Order/)).toBeInTheDocument();
    expect(getByText(/DateTime/)).toBeInTheDocument();
    expect(getByText(/\.\.\./)).toBeInTheDocument();

    // paths in the middle should be omitted
    expect(queryByText(/OrderDetail/)).not.toBeInTheDocument();
  });

});
