import React from 'react';
import { shallow } from 'enzyme';
import LoginForm from './login-form';

it('should render correctly with no props', () => {
  shallow(<LoginForm/>);
});