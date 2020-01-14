import React from 'react';
import { shallow } from 'enzyme';
import Bench from './Bench';

describe('Bench component', () => {
  it('should render correctly', () => {
    shallow(<Bench />);
  });
});