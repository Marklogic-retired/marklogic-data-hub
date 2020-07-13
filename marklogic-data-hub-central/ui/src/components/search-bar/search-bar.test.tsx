import React from 'react';
import SearchBar from './search-bar';
import { render, fireEvent, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/extend-expect'

describe('Search Bar', () => {
  const entities = ['Person']

  afterEach(cleanup);

  test('Verify the search bar and entity select options', () => {
    const { getByPlaceholderText, getByText } = render(<SearchBar entities={entities} />);
    const searchInput = getByPlaceholderText("Type search text");
    expect(searchInput).toHaveAttribute('value', '');
    userEvent.type(searchInput, 'test');
    expect(searchInput).toHaveAttribute('value', 'test');
    expect(getByText('All Entities')).toBeInTheDocument();
    fireEvent.click(getByText('All Entities'));
    expect(getByText('Person')).toBeInTheDocument();
  });

});
