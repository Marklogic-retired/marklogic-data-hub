import React from 'react';
import { shallow } from 'enzyme';
import SearchSummary from './search-summary';

describe("Search Summary component", () => {
  let wrapper;

  beforeAll(() => {
    wrapper = shallow(
      <SearchSummary 
        total={100}
        start={1}
        length={10}
        pageSize={10}
      />);
    });

  test("renders", () => {
    expect(wrapper.exists()).toBe(true);
    const totalDocs = wrapper.find('[data-cy="total-documents"]').text();
    expect(totalDocs).toEqual("100");
  }); 
})