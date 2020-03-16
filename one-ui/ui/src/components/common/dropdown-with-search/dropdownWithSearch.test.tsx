import React from 'react';
import { shallow } from 'enzyme';
import DropDownWithSearch from './dropdownWithSearch';

describe('DropDownWithSearch component', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = shallow(<DropDownWithSearch data/>)
  });

  test('DropDownWithSearch component renders ', () => {
    expect(wrapper.find('#dropdownList').length).toEqual(1)
  });
});