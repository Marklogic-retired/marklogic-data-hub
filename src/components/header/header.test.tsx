import React from 'react';
import { shallow } from 'enzyme';
import Header from './header';

it('should render correctly with no props', () => {
  shallow(<Header/>);
});