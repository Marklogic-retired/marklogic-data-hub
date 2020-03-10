
import React from 'react';
import { render } from '@testing-library/react';
import SelectedFacets from './selected-facets';


test('No Selected Facets', () => {
  const { getByTestId } = render(
    <SelectedFacets selectedFacets={[]}/>,
  )
  const container = getByTestId('selected-facet-block')
  expect(container).toHaveStyle('visibility: hidden');
});

test('Selected Facets: String facet selected', () => {
  const { getByTestId } = render(
    <SelectedFacets 
      selectedFacets={[{constraint: 'Collection', facet: 'productMapping'}]}
    />,
  )
  let clearAllButton = getByTestId('clear-all-button');
  let facetButton = getByTestId('clear-productMapping');
  expect(facetButton).toBeInTheDocument();
  expect(clearAllButton).toBeInTheDocument();
});

test('Selected Facets: Date facet selected', () => {
  const { getByTestId, getByText } = render(
    <SelectedFacets 
      selectedFacets={[{constraint: 'createdOnRange', facet: { lowerBound: "2019-10-15", upperBound: "2019-11-10" }}]}
    />,
  )
  let clearAllButton = getByTestId('clear-all-button');
  expect(getByText(/2019-10-15 ~ 2019-11-10/i)).toBeInTheDocument();
  expect(clearAllButton).toBeInTheDocument();
});

test('Selected Facets: Date/time facet selected', () => {
  const { getByTestId, getByText } = render(
    <SelectedFacets 
      selectedFacets={[{constraint: 'OrderDate', rangeValues: { lowerBound: "2020-03-03T17:20:40", upperBound: "2020-03-05T17:40:20" }}]}
    />,
  )
  let clearAllButton = getByTestId('clear-all-button');
  expect(getByText(/OrderDate: 2020-03-03T17:20:40 ~ 2020-03-05T17:40:20/i)).toBeInTheDocument();
  expect(clearAllButton).toBeInTheDocument();
});

test('Selected Facets: Numeric facet selected', () => {
  const { getByTestId, getByText } = render(
    <SelectedFacets 
      selectedFacets={[{constraint: 'sliderMock', rangeValues: { lowerBound: 10, upperBound: 50 }}]}
    />,
  )
  let clearAllButton = getByTestId('clear-all-button');
  expect(getByText(/sliderMock: 10 ~ 50/i)).toBeInTheDocument();
  expect(clearAllButton).toBeInTheDocument();
});