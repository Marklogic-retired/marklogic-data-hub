import React from 'react';
import { shallow } from 'enzyme';
import Curate from './Curate';

describe('Install component', () => {
  it('should render correctly', () => {
    shallow(<Curate />);
  });
});