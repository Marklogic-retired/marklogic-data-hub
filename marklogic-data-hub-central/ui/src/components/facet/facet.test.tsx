import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Facet from './facet';
import { facetValues } from '../../assets/mock-data/entity-table';

describe("Facet component", () => {
  it("Facet component renders with data properly" , () => {
    const { getByTestId, getByText, queryByLabelText } = render(
        <Facet
          name="sales_region"
          constraint="sales_region"
          facetValues={facetValues}
          key=""
          tooltip=""
          facetType="xs:string"
          facetCategory="entity"
          updateSelectedFacets={jest.fn()}
          addFacetValues={jest.fn()}
          referenceType="element"
          entityTypeId=""
          propertyPath="sales_region"
        />
    )
    expect(getByText(/sales_region/i)).toBeInTheDocument();

    expect(getByText(/Customer/i)).toBeInTheDocument();
    expect(getByText(/50/i)).toBeInTheDocument();
    expect(getByText(/OrderDetail/i)).toBeInTheDocument();
    expect(getByText(/15,000/i)).toBeInTheDocument();

    fireEvent.click(getByTestId("show-more"));
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
    const { getByTestId, getByText } = render(
        <Facet
          name="Sales.sales_region"
          constraint="Sales.sales_region"
          facetValues={facetValues}
          key=""
          tooltip=""
          facetType="xs:string"
          facetCategory="entity"
          updateSelectedFacets={jest.fn()}
          addFacetValues={jest.fn()}
          referenceType="element"
          entityTypeId=""
          propertyPath="sales_region"
        />
    )
    expect(getByText(/Sales.sales_region/i)).toBeInTheDocument();

    expect(getByText(/Customer/i)).toBeInTheDocument();
    expect(getByText(/50/i)).toBeInTheDocument();
    expect(getByText(/OrderDetail/i)).toBeInTheDocument();
    expect(getByText(/15,000/i)).toBeInTheDocument();

    fireEvent.click(getByTestId("show-more"));
    // show extra facets
    expect(getByText(/ProductDetail/i)).toBeInTheDocument();
    expect(getByText(/4,095/i)).toBeInTheDocument();
    expect(getByText(/Protein/i)).toBeInTheDocument();
    expect(getByText(/607/i)).toBeInTheDocument();
    expect(getByText(/CustomerType/i)).toBeInTheDocument();
    expect(getByText(/999/i)).toBeInTheDocument();
  });

  it("Collapse/Expand carets render properly for facet properties" , () => {
    const { getByTestId } = render(
        <Facet
          name="sales_region"
          constraint="sales_region"
          facetValues={facetValues}
          key=""
          tooltip=""
          facetType="xs:string"
          facetCategory="entity"
          updateSelectedFacets={jest.fn()}
          addFacetValues={jest.fn()}
          referenceType="element"
          entityTypeId=""
          propertyPath="sales_region"
        />
    )

    expect(getByTestId('sales_region-toggle')).toBeInTheDocument();
    expect(document.querySelector('[data-testid=sales_region-toggle] i svg')).toBeInTheDocument();
    expect(document.querySelector('[data-testid=sales_region-toggle] i svg')).not.toHaveStyle('transform: rotate(180deg);');
    fireEvent.click(getByTestId('sales_region-toggle')); 
    expect(document.querySelector('[data-testid=sales_region-toggle] i svg')).toHaveStyle('transform: rotate(180deg);');
  });

  it("Search link shown when facet number greater than limit" , () => {
    const LIMIT =  20;
    const f = {
      "name": "facetName",
      "count": 123,
      "value": "facetValue"
    };
    let facetVals: any = [];
    for (let i = 0; i < LIMIT; i++) {
      facetVals.push(f);
    }
    const { getByLabelText, debug } = render(
        <Facet
          name="sales_region"
          constraint="sales_region"
          facetValues={facetVals}
          key=""
          tooltip=""
          facetType="xs:string"
          facetCategory="entity"
          updateSelectedFacets={jest.fn()}
          addFacetValues={jest.fn()}
          referenceType="element"
          entityTypeId=""
          propertyPath="sales_region"
        />
    )
    // Search link shown for facets >= 20
    expect(getByLabelText('popover-search-label')).toBeInTheDocument();
  });

});
