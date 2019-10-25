import React from 'react';
import { mount } from 'enzyme';
import SearchPagination from './search-pagination';

describe("Search Pagination component", () => {
  let wrapper;

  describe("change current page", () => {
    beforeEach(() => {
      wrapper = mount(
        <SearchPagination 
          total={10}
          pageSize={10}
          currentPage={1}
        />);
    });
    test("renders", () => {
      expect(wrapper.find('.ant-pagination')).toHaveLength(1);
      const pageSize = wrapper.find('.ant-select-selection-selected-value').text();
      expect(pageSize).toEqual('10 / page');
    }); 
  });
      // TODO add click simulation
    // test("click on page number works", () => {
    //   wrapper.find('.ant-pagination-item-3').simulate('click');
    // });

  });