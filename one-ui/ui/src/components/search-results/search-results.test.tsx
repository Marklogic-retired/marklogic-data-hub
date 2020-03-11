import React from 'react';
import { shallow } from 'enzyme';
import SearchResults from './search-results';
import searchResults from '../../assets/mock-data/search-results';

describe("Search Results component", () => {
  let wrapper;

  beforeAll(() => {
    wrapper = shallow(
      <SearchResults 
        data={searchResults} 
        entityDefArray={[{name: 'Customer', primaryKey:'id'}]}
      />);
  });

  test("component renders", () => {
    expect(wrapper.exists('#search-results')).toBe(true);
  });
})