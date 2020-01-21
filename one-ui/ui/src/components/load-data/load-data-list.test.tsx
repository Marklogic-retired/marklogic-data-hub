import React from 'react';
import { shallow } from 'enzyme';
import LoadDataList from './load-data-list';

describe('Load data component', () => {
  it('should render correctly', () => {
    shallow(<LoadDataList data/>);
  });
});