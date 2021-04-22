import React from "react";
import {act} from "react-dom/test-utils";
import {render} from "@testing-library/react";
import NumericFacet from "./numeric-facet";
jest.mock("../../api/facets");

describe("<NumericFacet/>", () => {
  test("Numeric component renders without crashing, has range slider", async () => {
    const {getByTestId} = render(<NumericFacet
      name={""}
      step={0}
      constraint={""}
      datatype={""}
      onChange={jest.fn()}
      referenceType={""}
      entityTypeId={""}
      propertyPath={""}
    />);

    await act(async () => {
      expect(getByTestId("numeric-slider")).toBeInTheDocument();
    });
  });

  test("Numeric component renders with mock data", async (done) => {
    const {getByTestId, getByDisplayValue} = render(<NumericFacet
      name={"age"}
      step={1}
      constraint={"age"}
      datatype={"int"}
      onChange={jest.fn()}
      referenceType={"element"}
      entityTypeId={""}
      propertyPath={"age"}
    />);

    await act(async () => {
      setTimeout(() => {
        //verify range slider renders
        expect(getByTestId("numeric-slider")).toBeInTheDocument();
        //verify range slider min value
        expect(getByDisplayValue("11")).toBeInTheDocument();
        //verify range slider max value
        expect(getByDisplayValue("110")).toBeInTheDocument();
        done();
      });
    });
  });

  test("Can render name with nested property", async () => {
    const {getByText, queryByText} = render(<NumericFacet
      name={"Order.OrderDetail.DateTime"}
      constraint={"Order.OrderDetail.DateTime"}
      step={0}
      datatype={""}
      onChange={jest.fn()}
      referenceType={""}
      entityTypeId={""}
      propertyPath={""}
    />);

    expect(getByText(/Order/)).toBeInTheDocument();
    expect(getByText(/DateTime/)).toBeInTheDocument();
    expect(getByText(/\.\.\./)).toBeInTheDocument();

    // paths in the middle should be omitted
    expect(queryByText(/OrderDetail/)).not.toBeInTheDocument();
  });
});


