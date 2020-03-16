import React from 'react';
import { shallow } from 'enzyme';
import LoadDataSettingsDialog from './load-data-settings-dialog';

describe('Update data load settings component', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = shallow(<LoadDataSettingsDialog data/>)
  });

  test('Settings Dialog renders ', () => {
    expect(wrapper.find('#targetDatabase').length).toEqual(1);
    expect(wrapper.find('#additionalColl').length).toEqual(1);
    expect(wrapper.find('#targetPermissions').length).toEqual(1);
    expect(wrapper.find('#provGranularity').length).toEqual(1);
    //Unless Custom Hook is toggled following wont show up in GUI
    expect(wrapper.find('#cHparameters').length).toEqual(0);
    expect(wrapper.find('#user').length).toEqual(0);
    expect(wrapper.find('#module').length).toEqual(0);
  });
});
