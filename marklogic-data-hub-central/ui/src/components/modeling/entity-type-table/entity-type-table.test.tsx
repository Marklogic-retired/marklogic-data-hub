import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import EntityTypeTable from './entity-type-table';

import { getEntityTypes } from '../../../assets/mock-data/modeling';

describe('EntityTypeModal Component', () => {
  test('Table renders with empty array prop', () => {
    const { getByText } =  render(
      <Router>
        <EntityTypeTable 
          allEntityTypesData={[]}
        />
      </Router>);

    expect(getByText('Name')).toBeInTheDocument();
    expect(getByText('Instances')).toBeInTheDocument();
    expect(getByText('Last Processed')).toBeInTheDocument();
  });

    test('Table renders with mock data', () => {
      const { getByText, getByTestId } =  render(
        <Router>
          <EntityTypeTable 
            allEntityTypesData={getEntityTypes}
          />
        </Router>);

      expect(getByText(/Customer/i)).toBeInTheDocument();
      expect(getByText(/1,000/i)).toBeInTheDocument();
      expect(getByTestId('Customer-last-processed')).toBeInTheDocument();

      expect(getByText(/Order/i)).toBeInTheDocument();
      expect(getByText(/2,384/i)).toBeInTheDocument();
      expect(getByTestId('Order-last-processed')).toBeInTheDocument();

      // Verify sorting doesn't crash the component
      userEvent.click(getByText('Name'));
      userEvent.click(getByText('Last Processed'));
      userEvent.click(getByText('Instances'));
      });
});

