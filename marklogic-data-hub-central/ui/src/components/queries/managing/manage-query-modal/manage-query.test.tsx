import React from 'react';
import { fireEvent, render, waitForElement } from "@testing-library/react";
import ManageQuery from './manage-query';

const getSubElements = (content, node, title) => {
    const hasText = node => node.textContent === title;
    const nodeHasText = hasText(node);
    const childrenDontHaveText = Array.from(node.children).every(
        child => !hasText(child)
    );
    return nodeHasText && childrenDontHaveText;
};

describe('Query Modal Component', () => {

  let query = [{ "savedQuery": { "id": "00529904-ed6e-4539-b7d8-eeddaf15aaa4", "name": "Lee", "description": "", "query": { "searchText": "", "entityTypeIds": ["Customer"], "selectedFacets": { "firstname": { "dataType": "xs:string", "stringValues": ["Lee"] } } }, "propertiesToDisplay": ["id"], "owner": "admin", "systemMetadata": { "createdBy": "admin", "createdDateTime": "2020-05-05T14:48:53.206721-07:00", "lastUpdatedBy": "admin", "lastUpdatedDateTime": "2020-05-05T14:48:53.206721-07:00" } } }];
  let defaultProps = {
    modalVisibility: true,
    canExportQuery: false,
    isSavedQueryUser: false,
    queries: query,
    setQueries: jest.fn(),
    toggleApply: jest.fn(),
    queryName: 'Lee',
    setQueryName: jest.fn(),
    setCurrentQueryName: jest.fn()
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
    const { queryByTestId } = render(<ManageQuery {...defaultProps} isSavedQueryUser={true} />);
    expect(queryByTestId('link')).toBeNull();
  });

  test('Verify confirmation modal message for deleting a query', async () => {
    const { getByTestId, getByText } = render(<ManageQuery {...defaultProps} isSavedQueryUser={true} currentQueryName={'Lee'}/>);
    expect(getByTestId('delete')).toBeInTheDocument();
    fireEvent.click(getByTestId('delete'));
    expect(await(waitForElement(() => getByText((content, node) => {
          return getSubElements(content, node,"Are you sure you would like to delete the Lee query? This action cannot be undone.");
    })))).toBeInTheDocument();
  });
});
