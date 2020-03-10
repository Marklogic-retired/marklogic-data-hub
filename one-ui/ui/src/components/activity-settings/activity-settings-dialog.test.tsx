import React from 'react';
import ActivitySettingsDialog from './activity-settings-dialog';
import Axios from 'axios';
import { shallow } from 'enzyme';
import {act} from "react-dom/test-utils";

jest.mock('Axios');

describe('Update data load settings component', () => {
  let wrapper: any;
  let getSpy: any;
  let postSpy: any;


  beforeEach(() => {
    getSpy = jest.spyOn(Axios, 'get');
    postSpy = jest.spyOn(Axios, 'post');
    const stepData = {};
    wrapper = shallow(<ActivitySettingsDialog stepData={stepData}/>);
  });

  test('Settings Dialog renders ', () => {
    expect(wrapper.find('#sourceDatabase').length).toEqual(1)
    expect(wrapper.find('#targetDatabase').length).toEqual(1)
    expect(wrapper.find('#additionalColl').length).toEqual(1)
    expect(wrapper.find('#targetPermissions').length).toEqual(1)
    expect(wrapper.find('#provGranularity').length).toEqual(1)
    expect(wrapper.find('#additionalColl').length).toEqual(1)
    // Custom hook hasn't been expanded yet
    expect(wrapper.find('#cHparameters').length).toEqual(0)
    expect(wrapper.find('#user').length).toEqual(0)
    expect(wrapper.find('#module').length).toEqual(0)
  });

  test('Expect post to be called when saved ', () => {
    expect(getSpy).not.toBeCalled();
    expect(postSpy).not.toBeCalled();
    act(() => {
      wrapper.find('#saveButton').props().onClick();
    });
    expect(postSpy).toBeCalled();
    expect(getSpy).not.toBeCalled();
  });

});
