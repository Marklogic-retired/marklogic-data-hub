import React from 'react';
import { mount } from 'enzyme';
import Detail from './Detail';


describe("Detail component", () => {

    let wrapper;

    beforeAll(() => {
        wrapper = mount(<Detail />)
    });

    test("renders", () => {
        expect(wrapper.exists()).toBe(true);
    })

    test("title contains id", () => {
        expect(wrapper.find('#title').text()).toContain('id: 152');
    })

    test("header contains datestamp ", () => {
        expect(wrapper.find('#header').text()).toContain('2019-07-16T12:03:07.665187-07:00');
    })

    test("header contains source ", () => {
        expect(wrapper.find('#header').text()).toContain('ingest-flow');
    })

    test("header contains user ", () => {
        expect(wrapper.find('#header').text()).toContain('admin');
    })

    test("instance/full menu renders", () => {
        expect(wrapper.find('#menu').text()).toContain('Instance');
        expect(wrapper.find('#menu').text()).toContain('Full');
    })

    test("back button renders", () => {
        expect(wrapper.find('#back-button').text()).toContain('Back');
    })

    test("json view renders on select menu", () => {
        expect(wrapper.find('.react-json-view')).toHaveLength(0);
        wrapper.find('#full').at(1).simulate('click');
        expect(wrapper.find('.react-json-view')).toHaveLength(1);
    })

    test("table view renders on select menu", () => {
        expect(wrapper.find('.ant-table-tbody')).toHaveLength(0);
        wrapper.find('#instance').at(1).simulate('click');
        expect(wrapper.find('.ant-table-tbody')).toHaveLength(1);
    })

})
