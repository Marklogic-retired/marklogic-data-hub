import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Facet from './facet';
import { facetProps } from '../../assets/mock-data/explore/facet-props';

describe("Facet component", () => {
  it("Facet component renders with data properly" , () => {
    const { getByTestId, getByText, queryByLabelText } = render(<Facet {...facetProps} />);

    expect(getByText(/sales_region/i)).toBeInTheDocument();

    expect(getByText(/Customer/i)).toBeInTheDocument();
    expect(getByText(/50/i)).toBeInTheDocument();
    expect(getByText(/OrderDetail/i)).toBeInTheDocument();
    expect(getByText(/15,000/i)).toBeInTheDocument();

    fireEvent.click(getByTestId("show-more-sales_region"));
    // show extra facets
    expect(getByText(/ProductDetail/i)).toBeInTheDocument();
    expect(getByText(/4,095/i)).toBeInTheDocument();
    expect(getByText(/Protein/i)).toBeInTheDocument();
    expect(getByText(/607/i)).toBeInTheDocument();
    expect(getByText(/CustomerType/i)).toBeInTheDocument();
    expect(getByText(/999/i)).toBeInTheDocument();
    // Search link not shown for facets < 20
    expect(queryByLabelText('popover-search-label')).not.toBeInTheDocument();
  });

  it("Facet component renders with nested data properly" , () => {
    const { getByTestId, getByText } = render(<Facet {...facetProps} name="Sales.sales_region" constraint="Sales.sales_region" />);
    expect(getByText(/Sales.sales_region/i)).toBeInTheDocument();

    expect(getByText(/Customer/i)).toBeInTheDocument();
    expect(getByText(/50/i)).toBeInTheDocument();
    expect(getByText(/OrderDetail/i)).toBeInTheDocument();
    expect(getByText(/15,000/i)).toBeInTheDocument();

    fireEvent.click(getByTestId("show-more-sales.sales_region"));
    // show extra facets
    expect(getByText(/ProductDetail/i)).toBeInTheDocument();
    expect(getByText(/4,095/i)).toBeInTheDocument();
    expect(getByText(/Protein/i)).toBeInTheDocument();
    expect(getByText(/607/i)).toBeInTheDocument();
    expect(getByText(/CustomerType/i)).toBeInTheDocument();
    expect(getByText(/999/i)).toBeInTheDocument();
  });

  it("Collapse/Expand carets render properly for facet properties" , () => {
    const { getByTestId } = render(<Facet {...facetProps} />);

    expect(getByTestId('sales_region-toggle')).toBeInTheDocument();
    expect(document.querySelector('[data-testid=sales_region-toggle] i svg')).toBeInTheDocument();
    expect(document.querySelector('[data-testid=sales_region-toggle] i svg')).not.toHaveStyle('transform: rotate(-90deg);');
    fireEvent.click(getByTestId('sales_region-toggle'));
    expect(document.querySelector('[data-testid=sales_region-toggle] i svg')).toHaveStyle('transform: rotate(-90deg);');
  });

  it("Search link shown only when facet number greater than limit" , () => {
    const LIMIT =  20,
          facetValsNew: any = [];
    for (let i = 0; i < LIMIT; i++) {
      facetValsNew.push({"name": "fName", "count": 1, "value": "fVal"});
    }
    const { getByLabelText, queryByLabelText, rerender } = render(<Facet {...facetProps} />);

    // Search link NOT shown for facets < LIMIT
    expect(queryByLabelText('popover-search-label')).not.toBeInTheDocument();

    rerender(<Facet {...facetProps} facetValues={facetValsNew}/>);

    // Search link shown for facets >= LIMIT
    expect(getByLabelText('popover-search-label')).toBeInTheDocument();
  });

});
