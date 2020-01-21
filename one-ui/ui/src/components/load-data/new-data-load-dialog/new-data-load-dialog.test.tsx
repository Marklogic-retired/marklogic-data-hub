import React from 'react';
import { shallow } from 'enzyme';
import NewDataLoadDialog from './new-data-load-dialog';

describe('New/Edit data load component', () => {
  it('should render correctly', () => {
    shallow(<NewDataLoadDialog data/>);
  });
});