import React from 'react';
import { fireEvent, render } from "@testing-library/react";
import QueryExportModal from './query-export-modal';


describe('Query Export Component', () => {

  let columns = ['id', 'firstName', 'lastName', 'age']

  test('Verify Query Export Modal Dialog renders', () => {
    const { getByTestId, getByText } = render(<QueryExportModal exportModalVisibility={true} columns={columns} />);
    expect(getByTestId('query-export-form')).toBeInTheDocument();
    expect(getByText('Rows:')).toBeInTheDocument();
    expect(getByText('All')).toBeInTheDocument();
    expect(getByText('Limited set of the first rows returned')).toBeInTheDocument();
    expect(getByText('Export to a CSV file containing the columns of data currently displayed.')).toBeInTheDocument();
  });

  test('Verify able to select All rows', () => {
    const { getByText } = render(<QueryExportModal exportModalVisibility={true} columns={columns} />);
    fireEvent.click(getByText('All'));
  });

  test('Verify able to select Limited number of rows', () => {
    const { getByText } = render(<QueryExportModal exportModalVisibility={true} columns={columns} />);
    fireEvent.click(getByText('Limited set of the first rows returned'));
  });

  test('Verify able to select Maximum rows', () => {
    const { getByTestId, getByLabelText, queryByText } = render(<QueryExportModal exportModalVisibility={true} columns={columns} />);

    const allRows = getByLabelText('All') as HTMLInputElement
    const limitedSet = getByLabelText('Limited set of the first rows returned') as HTMLInputElement

    expect(allRows).toBeChecked();
    expect(limitedSet).not.toBeChecked();
    expect(queryByText("All")).toBeInTheDocument();
    fireEvent.click(limitedSet);
    expect(allRows).not.toBeChecked();
    expect(limitedSet).toBeChecked();
    expect(queryByText("Limited set of the first rows returned")).toBeInTheDocument();
    expect(queryByText("Maximum rows:")).toBeInTheDocument();
  
    fireEvent.change(getByTestId('max-rows-input'), { target: { value: '1' } });
    expect(getByTestId('max-rows-input')['value']).toBe('1')
  });

  test('Verify not able to select zero or negative number of rows', () => {
    const { getByTestId, getByLabelText, queryByText, getByRole } = render(<QueryExportModal exportModalVisibility={true} columns={columns} />);

    const limitedSet = getByLabelText('Limited set of the first rows returned') as HTMLInputElement

    fireEvent.click(limitedSet);
    expect(queryByText("Limited set of the first rows returned")).toBeInTheDocument();
    expect(queryByText("Maximum rows:")).toBeInTheDocument();
  
    fireEvent.change(getByTestId('max-rows-input'), { target: { value: '0' } });
    expect(getByTestId('max-rows-input')['value']).toBe('0')
    expect(getByRole('button', { name: 'Export' })).toHaveAttribute('disabled');
    
    fireEvent.change(getByTestId('max-rows-input'), { target: { value: '-1' } });
    expect(getByTestId('max-rows-input')['value']).toBe('-1')
    expect(getByRole('button', { name: 'Export' })).toHaveAttribute('disabled');

  });

  test('Verify query export modal closes when Cancel is clicked', () => {
    const { getByText, getByRole, queryByText } = render(<QueryExportModal exportModalVisibility={true} columns={columns} />);
    fireEvent.click(getByText('Limited set of the first rows returned'));
    getByRole('button', { name: 'Cancel' })
    expect(queryByText('Limited set of the first rows returned"')).not.toBeInTheDocument();
  });

});