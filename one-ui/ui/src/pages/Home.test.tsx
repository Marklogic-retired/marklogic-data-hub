import React from 'react';
import { shallow } from 'enzyme';
import Home from './Home';

describe('Home component', () => {
  it('should render correctly', () => {
    shallow(<Home />);
  });
});