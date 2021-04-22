import React from "react";
import {render} from "@testing-library/react";
import DateFacet from "./date-facet";

describe("Date facet", () => {

  test("Date facet component renders without crashing", async () => {
    const {getByTestId} = render(<DateFacet
      name={"date-facet"}
      constraint={"date-facet"}
      datatype={"date"}
      propertyPath={"date-facet"}
      key={"0"}
      onChange={jest.fn()}
    />);

    const dateFacet = getByTestId("facet-date-picker");
    expect(dateFacet).toBeInTheDocument();
    expect(dateFacet).toHaveTextContent("date-facet");
  });

  test("Can render with nested properties", async () => {
    const {getByTestId, getByText, queryByText} = render(<DateFacet
      name={"Order.OrderDetail.DateTime"}
      constraint={"Order.OrderDetail.DateTime"}
      datatype={"dateTime"}
      propertyPath={"DateTime"}
      key={"0"}
      onChange={jest.fn()}
    />);

    const dateFacet = getByTestId("facet-date-picker");
    expect(dateFacet).toBeInTheDocument();

    expect(getByText(/Order/)).toBeInTheDocument();
    expect(getByText(/DateTime/)).toBeInTheDocument();
    expect(getByText(/\.\.\./)).toBeInTheDocument();

    // paths in the middle should be omitted
    expect(queryByText(/OrderDetail/)).not.toBeInTheDocument();
  });

});
