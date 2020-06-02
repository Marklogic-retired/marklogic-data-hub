import React from 'react';
import { fireEvent, render } from "@testing-library/react";
import ManageQuery from './manage-query';


describe('Query Modal Component', () => {

  let query = [{ "savedQuery": { "id": "00529904-ed6e-4539-b7d8-eeddaf15aaa4", "name": "Lee", "description": "", "query": { "searchText": "", "entityTypeIds": ["Customer"], "selectedFacets": { "firstname": { "dataType": "xs:string", "stringValues": ["Lee"] } } }, "propertiesToDisplay": ["id"], "owner": "admin", "systemMetadata": { "createdBy": "admin", "createdDateTime": "2020-05-05T14:48:53.206721-07:00", "lastUpdatedBy": "admin", "lastUpdatedDateTime": "2020-05-05T14:48:53.206721-07:00" } } }]

  test('Verify modal is not visible', () => {
    const { queryByTestId } = render(<ManageQuery />);
    expect(queryByTestId('manage-queries-modal')).toBeNull();
  });

  test('Verify export button is visible', () => {
    const { getByTestId } =  render(<ManageQuery canExportQuery={true} queries={query} setQueries={jest.fn()} toggleApply={jest.fn()} queryName={'Lee'} setQueryName={jest.fn()} />);    
    expect(getByTestId('manage-queries-modal-icon')).toBeInTheDocument();
    fireEvent.click(getByTestId('manage-queries-modal-icon'));
    expect(getByTestId('manage-queries-modal')).toBeInTheDocument();
    expect(getByTestId('export')).toBeInTheDocument();
  });


  test('Verify export button is not visible', () => {
    const { getByTestId, queryByTestId } = render(<ManageQuery canExportQuery={false} queries={query} setQueries={jest.fn()} toggleApply={jest.fn()} queryName={'Lee'} setQueryName={jest.fn()} />);
    expect(getByTestId('manage-queries-modal-icon')).toBeInTheDocument();
    fireEvent.click(getByTestId('manage-queries-modal-icon'));
    expect(getByTestId('manage-queries-modal')).toBeInTheDocument();
    expect(queryByTestId('export')).toBeNull()
  });

  test('Verify edit button is not visible', () => {
    const { queryByTitle } = render(<ManageQuery isSavedQueryUser={false} canExportQuery={false} queries={query} setQueries={jest.fn()} toggleApply={jest.fn()} queryName={'Lee'} setQueryName={jest.fn()} />);
    expect(queryByTitle('Edit')).not.toBeInTheDocument();
  });

  test('Verify delete button is not visible', () => {
    const { queryByTitle } = render(<ManageQuery isSavedQueryUser={false} canExportQuery={false} queries={query} setQueries={jest.fn()} toggleApply={jest.fn()} queryName={'Lee'} setQueryName={jest.fn()} />);
    expect(queryByTitle('Delete')).not.toBeInTheDocument();
  });

});