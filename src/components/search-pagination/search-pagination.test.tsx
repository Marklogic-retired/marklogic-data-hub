import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import Pagination from './search-pagination';

describe("Search Pagination component", () => {

    let wrapper;

    beforeAll(() => {
        wrapper = mount(<Router><Pagination total={10}/></Router>);
      });

    test("renders", () => {
        expect(wrapper.exists()).toBe(true);
    }); 

    test("search pagination page renders", () => {
        expect(wrapper.find('.ant-pagination-prev')).toHaveLength(1);
        expect(wrapper.find('.ant-pagination-item-3')).toHaveLength(1);
        expect(wrapper.find('.ant-pagination-next')).toHaveLength(1);
    });

    test("click on search page", () => {
        wrapper.find('.ant-pagination-item-3').simulate('click');
        expect(wrapper.find('.ant-pagination-item-active a').text()).toEqual("3");
    });
})