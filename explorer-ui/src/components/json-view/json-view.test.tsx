import React from 'react';
import { mount } from 'enzyme';
import JsonView from '../../components/json-view/json-view';
import MockDocument from '../../assets/mock-data/example';


describe("Json view component", () => {
    let wrapper;

    beforeAll(() => {
        wrapper = mount(<JsonView document={MockDocument}/>)
      });

    test("renders", () => {
        expect(wrapper.exists()).toBe(true);
    }) 

    test("json-view renders", () => {
        expect(wrapper.find('.react-json-view')).toHaveLength(1);
    }) 
})
