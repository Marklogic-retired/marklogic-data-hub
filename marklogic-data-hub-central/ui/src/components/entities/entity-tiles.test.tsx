import React from 'react';
import { shallow } from 'enzyme';
import EntityTiles from './entity-tiles';

describe('Entity tiles component', () => {
  it('should render correctly', () => {
    shallow(<EntityTiles />);
  });
});