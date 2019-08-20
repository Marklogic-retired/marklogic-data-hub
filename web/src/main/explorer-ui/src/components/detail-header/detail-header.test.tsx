import React from 'react';
import { mount } from 'enzyme';
import DetailHeader from './detail-header';
import MockDocument from '../../assets/example';



describe("Detail component", () => {

    let wrapper;

    beforeAll(() => {
        wrapper = mount(<DetailHeader document={MockDocument}/>)
    });

    test("renders", () => {
        expect(wrapper.exists()).toBe(true);
    })

    test("header renders", () => {
        expect(wrapper.find('#header')).toHaveLength(1);
    })

    test("title renders", () => {
        expect(wrapper.find('#title')).toHaveLength(1);
    })

    test("summary renders", () => {
        expect(wrapper.find('#summary')).toHaveLength(1);
    })
})
