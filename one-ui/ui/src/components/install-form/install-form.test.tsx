import React from 'react';
import { shallow } from 'enzyme';
import InstallForm from './install-form';


describe('Install page', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = shallow(<InstallForm />)
  });

  test('login fields renders ', () => {
    expect(wrapper.exists('.anticon-check-circle')).toBe(true);
    expect(wrapper.find('#directory').length).toEqual(1);
  });

});
