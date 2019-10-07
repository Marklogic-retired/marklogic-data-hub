import React from 'react';
import { mount } from 'enzyme';
import SearchPagination from './search-pagination';

describe("Search Pagination component", () => {

    let wrapper;
    const pageChangeFn = jest.fn();
    const pageLengthChangeFn = jest.fn();

    beforeAll(() => {
        wrapper = mount(
          <SearchPagination 
            total={10}
            pageLength={1}
            currentPage={1}
            onPageChange={pageChangeFn}
            onPageLengthChange={pageLengthChangeFn} 
          />);
      });

    test("renders", () => {
        expect(wrapper.exists()).toBe(true);
    }); 

    test("search pagination component renders", () => {
        expect(wrapper.find('.ant-pagination-prev')).toHaveLength(1);
        expect(wrapper.find('.ant-pagination-item-3')).toHaveLength(1);
        expect(wrapper.find('.ant-pagination-next')).toHaveLength(1);
    });

    test("click on page number", () => {
        wrapper.find('.ant-pagination-item-3').simulate('click');
        expect(pageChangeFn).toHaveBeenCalled();
    });
})