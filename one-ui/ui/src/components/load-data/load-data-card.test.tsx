import React from 'react';
import { shallow } from 'enzyme';
import LoadDataCard from './load-data-card';

describe('Load data Card component', () => {
  it('should render correctly', () => {
    shallow(<LoadDataCard data/>);
  });
});