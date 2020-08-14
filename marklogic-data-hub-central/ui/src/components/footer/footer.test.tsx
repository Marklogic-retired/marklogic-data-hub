import React from 'react';
import { mount } from 'enzyme';
import Footer from './footer';

describe('Footer component', () => {
    let wrapper;

    beforeAll(() => {
        wrapper = mount(<Footer />);
    });

    it('should render correctly', () => {
        expect(wrapper.exists('.ant-layout-footer')).toBe(true);
    });

    it('should display correct text', () => {
        const currentYear = (new Date()).getFullYear();
        expect(wrapper.text()).toBe('© ' + currentYear + ' MarkLogic Corporation|Privacy');
    });
});
