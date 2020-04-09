import React from 'react';
import { shallow } from 'enzyme';
import EntityTypes from './EntityTypes';

describe('Install component', () => {
  it('should render correctly', () => {
    shallow(<EntityTypes />);
  });
});