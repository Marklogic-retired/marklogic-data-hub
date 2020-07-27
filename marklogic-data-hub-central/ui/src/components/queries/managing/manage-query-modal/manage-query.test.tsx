import React from 'react';
import { fireEvent, render } from "@testing-library/react";
import ManageQuery from './manage-query';


describe('Query Modal Component', () => {

  let query = [{ "savedQuery": { "id": "00529904-ed6e-4539-b7d8-eeddaf15aaa4", "name": "Lee", "description": "", "query": { "searchText": "", "entityTypeIds": ["Customer"], "selectedFacets": { "firstname": { "dataType": "xs:string", "stringValues": ["Lee"] } } }, "propertiesToDisplay": ["id"], "owner": "admin", "systemMetadata": { "createdBy": "admin", "createdDateTime": "2020-05-05T14:48:53.206721-07:00", "lastUpdatedBy": "admin", "lastUpdatedDateTime": "2020-05-05T14:48:53.206721-07:00" } } }]
  let defaultProps = {
      modalVisibility: true,
      canExportQuery: false,
      isSavedQueryUser: false,
      queries: query,
      setQueries: jest.fn(),
      toggleApply: jest.fn(),
      queryName: 'Lee',
      setQueryName: jest.fn()
  };

  test('Verify modal is not visible', () => {
    const { queryByTestId } = render(<ManageQuery />);
    expect(queryByTestId('manage-queries-modal')).toBeNull();
  });

  test('Verify export, edit, delete buttons are visible', () => {
    const { getByTestId } = render(<ManageQuery {...defaultProps} canExportQuery={true} isSavedQueryUser={true} />);
    expect(getByTestId('manage-queries-modal')).toBeInTheDocument();
    expect(getByTestId('export')).toBeInTheDocument();
    expect(getByTestId('delete')).toBeInTheDocument();
    expect(getByTestId('edit')).toBeInTheDocument();
  });

  test('Verify export, edit, delete buttons are not visible', () => {
    const { queryByTestId } = render(<ManageQuery {...defaultProps} />);
    expect(queryByTestId('export')).toBeNull();
    expect(queryByTestId('delete')).toBeNull();
    expect(queryByTestId('edit')).toBeNull();
  });

  test('Verify link column does not exist', () => {
    const { queryByTitle } = render(<ManageQuery {...defaultProps} modalVisibility={true} />);
    expect(queryByTitle('Link')).toBeNull();
  });
});
