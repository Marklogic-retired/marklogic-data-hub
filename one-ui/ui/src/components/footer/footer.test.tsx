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
});
