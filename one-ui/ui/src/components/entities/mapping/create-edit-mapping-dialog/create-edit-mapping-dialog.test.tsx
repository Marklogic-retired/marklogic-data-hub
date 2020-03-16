import React from 'react';
import { shallow } from 'enzyme';
import CreateEditMappingDialog from './create-edit-mapping-dialog';

describe('Create/Edit Mapping artifact component', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = shallow(<CreateEditMappingDialog data/>)
  });

  test('Create/Edit Mapping Dialog renders ', () => {
    expect(wrapper.find('#name').length).toEqual(1);
    expect(wrapper.find('#description').length).toEqual(1);
    expect(wrapper.find('#srcType').length).toEqual(1);
    expect(wrapper.find('#srcQuery').length).toEqual(0);
    expect(wrapper.find('#collList').length).toEqual(1);
  });
});
