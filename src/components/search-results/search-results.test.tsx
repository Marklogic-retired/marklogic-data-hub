import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import SearchResults from './search-results';
import MockData from '../../assets/mock-data/search-results';

describe("Search Results component", () => {

    let wrapper;

    beforeAll(() => {
        wrapper = shallow(<Router><SearchResults data={MockData} entityDefArray={[{name: 'Customer', primaryKey:'id'}]}/></Router>);
    });

    test("renders", () => {
        expect(wrapper.exists()).toBe(true);
    });
    
    // test("list of search results", () => {
    //     expect(wrapper.find('.ant-list-item')).toHaveLength(10);
    // });

    /*test("first search results", () => {
        expect(wrapper.find('.ant-list-item-meta-title').first()).toHaveLength(1);
        expect(wrapper.find('.ant-list-item-meta-title').first().text()).toEqual('Customer > id: 123');
    });*/
})