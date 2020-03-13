import React from 'react';
import { shallow } from 'enzyme';
import CreateEditMatchingDialog from './create-edit-matching-dialog';

describe('Create/Edit Matching artifact component', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = shallow(<CreateEditMatchingDialog data/>)
  });

  test('Create/Edit Matching Dialog renders ', () => {
    expect(wrapper.find('#name').length).toEqual(1)
    expect(wrapper.find('#description').length).toEqual(1)
    expect(wrapper.find('#srcType').length).toEqual(1)
    expect(wrapper.find('#srcQuery').length).toEqual(0)
    expect(wrapper.find('#collList').length).toEqual(1)
  });
});
