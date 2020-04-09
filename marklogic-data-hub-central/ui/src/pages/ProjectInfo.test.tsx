import React from 'react';
import { shallow } from 'enzyme';
import ProjectInfo from './ProjectInfo';

describe('ProjectInfo component', () => {
  it('should render correctly', () => {
    shallow(<ProjectInfo />);
  });
});