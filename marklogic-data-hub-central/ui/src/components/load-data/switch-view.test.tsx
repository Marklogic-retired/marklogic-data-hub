import React from 'react';
import { shallow } from 'enzyme';
import SwitchView from './switch-view';

describe('View selector component', () => {
  it('should render correctly', () => {
    shallow(<SwitchView handleSelection/>);
  });
});