import React from 'react';
import { shallow } from 'enzyme';
import LoginForm from './login-form';


describe('JSON result with Primary Key', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<LoginForm />)
  });

  test('login fields renders ', () => {
    expect(wrapper.find('#username').length).toEqual(1)
    expect(wrapper.find('#password').length).toEqual(1)
    expect(wrapper.find('#submit').length).toEqual(1)
    expect(wrapper.find('[data-cy="forgot"]').length).toEqual(1)
  });

});