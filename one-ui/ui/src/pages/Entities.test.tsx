import React from 'react';
import { shallow } from 'enzyme';
import Entities from './Entities';

describe('Install component', () => {
  it('should render correctly', () => {
    shallow(<Entities />);
  });
});