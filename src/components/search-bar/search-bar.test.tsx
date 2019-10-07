import React from 'react';
import { mount } from 'enzyme';
import SearchBar from './search-bar';
import { entityFromJSON } from '../../util/data-conversion';
import modelResponse from '../../assets/mock-data/model-response';

describe("Search Bar component", () => {
    let wrapper;
    const entities = [ ...entityFromJSON(modelResponse).map(entity => entity.info.title)]

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

    test("enter text on search input", () => {
        wrapper.find('.ant-input-search input')
            .simulate('change', { target: {value: 'John Smith'}});
        expect(wrapper.find('.ant-input-search input').instance().value).toEqual('John Smith');
    });

    test("click on search button", () => {
        wrapper.find('.ant-input-search button').simulate('click');
    });
})