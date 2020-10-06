import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render } from '@testing-library/react';

import EntityTable from './entity-table';
import { entityFromJSON } from '../../util/data-conversion';
import { entityModel, latestJobs, facetValues } from '../../assets/mock-data/modeling/entity-table';

describe("Entity Table component", () => {
  test('Entity table with data renders', () => {
    let entities = entityFromJSON(entityModel);
    const { getByTestId, getByText } = render(
      <Router>
        <EntityTable
          entities={entities}
          facetValues={facetValues}
          lastHarmonized={latestJobs}
        />
      </Router>,
    );
    // Check for Entity Column
    expect(getByTestId('OrderDetail')).toBeInTheDocument();
    expect(getByTestId('CustomerType')).toBeInTheDocument();
    expect(getByTestId('ProductGroupLicense')).toBeInTheDocument();
    expect(getByTestId('TestEntityForMapping')).toBeInTheDocument();

    // Check for Document Counts
    expect(getByText(/15,000/i)).toBeInTheDocument();
    expect(getByText(/4,095/i)).toBeInTheDocument();
    expect(getByText(/1,034/i)).toBeInTheDocument();
    expect(getByText(/300/i)).toBeInTheDocument();
    expect(getByText(/999/i)).toBeInTheDocument();
    expect(getByText(/12,584/i)).toBeInTheDocument();

    // Check for harmonized column
    expect(getByTestId('last-harmonized-OrderDetail')).toBeInTheDocument();
    expect(getByTestId('last-harmonized-CustomerType')).toBeInTheDocument();
    expect(getByTestId('last-harmonized-ProductGroupLicense')).toBeInTheDocument();
    expect(getByTestId('last-harmonized-TestEntityForMapping')).toBeInTheDocument();
  });

  test('Entity table with no data renders', () => {
    const { getByText } = render(
      <Router>
        <EntityTable
          entities={[]}
          facetValues={[]}
          lastHarmonized={[]}
        />
      </Router>,
    );
    // Check for Empty Table
    expect(getByText(/Entity Name/i)).toBeInTheDocument();
    expect(getByText(/Documents/i)).toBeInTheDocument();
    expect(getByText(/No Data/i)).toBeInTheDocument();
  });
});
