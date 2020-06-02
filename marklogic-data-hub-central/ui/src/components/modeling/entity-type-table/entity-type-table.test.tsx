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
          canReadEntityModel={true}
          canWriteEntityModel={true}
          autoExpand=''
          editEntityTypeDescription={jest.fn()}
        />
      </Router>);

    expect(getByText('Name')).toBeInTheDocument();
    expect(getByText('Instances')).toBeInTheDocument();
    expect(getByText('Last Processed')).toBeInTheDocument();
  });

    test('Table renders with mock data, no writer role', () => {
      const { getByText, getByTestId, getAllByRole, getByLabelText } =  render(
        <Router>
          <EntityTypeTable 
            allEntityTypesData={getEntityTypes}
            canReadEntityModel={true}
            canWriteEntityModel={false}
            autoExpand=''
            editEntityTypeDescription={jest.fn()}
          />
        </Router>);

      expect(getByText(/Customer/i)).toBeInTheDocument();
      expect(getByText(/1,000/i)).toBeInTheDocument();
      expect(getByTestId('Customer-last-processed')).toBeInTheDocument();

      expect(getByTestId('Customer-save-icon')).toHaveClass('iconSaveReadOnly');
      expect(getByTestId('Customer-revert-icon')).toHaveClass('iconRevertReadOnly');
      expect(getByTestId('Customer-trash-icon')).toHaveClass('iconTrashReadOnly');

      expect(getByText(/Order/i)).toBeInTheDocument();
      expect(getByText(/2,384/i)).toBeInTheDocument();
      expect(getByTestId('Order-last-processed')).toBeInTheDocument();

      // Verify sorting doesn't crash the component
      userEvent.click(getByText('Name'));
      userEvent.click(getByText('Last Processed'));
      userEvent.click(getByText('Instances'));

      userEvent.click(getAllByRole('button')[0]);

      expect(getByLabelText('AnotherModel-add-property')).toBeDisabled();
    });

    test('Table renders with mock data, with writer role, with auto expanded entity, and can click edit', () => {
      const editMock = jest.fn();
      const { getByTestId, getByLabelText } =  render(
        <Router>
          <EntityTypeTable 
            allEntityTypesData={getEntityTypes}
            canReadEntityModel={true}
            canWriteEntityModel={true}
            autoExpand='Order'
            editEntityTypeDescription={editMock}
          />
        </Router>);

      // Add back once functionality is added
      // expect(getByTestId('Order-save-icon')).toHaveClass('iconSave');
      // expect(getByTestId('Order-revert-icon')).toHaveClass('iconRevert');
      // expect(getByTestId('Order-trash-icon')).toHaveClass('iconTrash');

      userEvent.click(getByTestId('Order-span'));
      expect(editMock).toBeCalledTimes(1);
    });
});

