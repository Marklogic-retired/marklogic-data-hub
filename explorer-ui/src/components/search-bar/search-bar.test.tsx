import React from 'react';
import { mount } from 'enzyme';
import SearchBar from './search-bar';
import { entityFromJSON } from '../../util/data-conversion';
import modelResponse from '../../assets/mock-data/model-response';
import { render, fireEvent, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/extend-expect'

describe("Search Bar component", () => {
  let wrapper;
  const entities = [...entityFromJSON(modelResponse).map(entity => entity.info.title)]

  beforeAll(() => {
    wrapper = mount(<SearchBar entities={entities} />);
  });

  test("renders", () => {
    expect(wrapper.exists()).toBe(true);
  });

  test("search bar input renders", () => {
    expect(wrapper.find('.ant-input-search input')).toHaveLength(1);
  });

  test("search bar button renders", () => {
    expect(wrapper.find('.ant-input-search button')).toHaveLength(1);
  });

  test("click on search button", () => {
    wrapper.find('.ant-input-search button').simulate('click');
  });
})

describe('Search Bar', () => {
  const entities = ['Person']

  afterEach(cleanup);

  test('should type in the search bar', () => {
    const { getByPlaceholderText } = render(<SearchBar entities={entities} />);
    const searchInput = getByPlaceholderText("Type search text");
    expect(searchInput).toHaveAttribute('value', '');
    userEvent.type(searchInput, 'test');
    expect(searchInput).toHaveAttribute('value', 'test');
  });

  test('should render All Entities select option', () => {
    const { getByText } = render(<SearchBar entities={entities} />);
    const selector = getByText('All Entities');
    expect(selector).toBeInTheDocument();
  });

  test('should render props entity select option', () => {
    const { getByText, getByTestId } = render(<SearchBar entities={entities} />);
    const selector = getByTestId('entity-select');
    expect(selector).toBeInTheDocument();
    fireEvent.click(getByText('All Entities'));
    const elem = getByText('Person');
    expect(elem).toBeInTheDocument();
  });

});