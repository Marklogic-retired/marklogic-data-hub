import React from 'react';
import ActivitySettingsDialog from './activity-settings-dialog';
import axios, { AxiosRequestConfig, AxiosPromise, AxiosResponse } from 'axios';
import { shallow } from 'enzyme';
import {act} from "react-dom/test-utils";
import { fireEvent, render, waitForElementToBeRemoved } from "@testing-library/react";
import data from '../../config/data.config';

jest.mock('axios');

describe('Update data load settings component', () => {
  let wrapper: any;
  let getSpy: any;
  let postSpy: any;


  beforeEach(() => {
    getSpy = jest.spyOn(axios, 'get');
    postSpy = jest.spyOn(axios, 'post');
    wrapper = shallow(<ActivitySettingsDialog {...data.activitySettings}/>);
  });

  test('Settings Dialog renders ', () => {
    expect(wrapper.find('#sourceDatabase').length).toEqual(1)
    expect(wrapper.find('#targetDatabase').length).toEqual(1)
    expect(wrapper.find('#additionalColl').length).toEqual(1)
    expect(wrapper.find('#targetPermissions').length).toEqual(1)
    expect(wrapper.find('#provGranularity').length).toEqual(1)
    expect(wrapper.find('#additionalColl').length).toEqual(1)
    expect(wrapper.find('#targetPermissions').props().value).toEqual('data-hub-operator,read,data-hub-operator,update')
    // Custom hook hasn't been expanded yet
    expect(wrapper.find('#cHparameters').length).toEqual(0)
    expect(wrapper.find('#user').length).toEqual(0)
    expect(wrapper.find('#module').length).toEqual(0)
  });

  test('Load Data Settings Dialog renders without source database ', () => {
    //Overriding props set in beforeEach, to test for loadData settings
    wrapper.setProps({activityType:'loadData'});
    expect(wrapper.find('#sourceDatabase').length).toEqual(0)
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

  test('Expect post to be called when saved ',  () => {
      /**
       * below RTL test passes but it also throws a warning about "not wrapped in act".
       * This maybe due to setIsLoading() function and its promise needs to be resolved. Should find a way to fix this
       * Enzyme test throws a promise rejection warning as well. Probably the fix is same
      **/

      /*const { getByText } = render(<ActivitySettingsDialog {...data.activitySettings} />);
      expect(getByText('Save')).toBeInTheDocument();
      fireEvent.click(getByText('Save'));
      expect(postSpy).toBeCalled();*/
    expect(getSpy).not.toBeCalled();
    expect(postSpy).not.toBeCalled();
    act(() => {
      wrapper.find('#saveButton').props().onClick();
    });
    expect(postSpy).toBeCalled();
    expect(getSpy).not.toBeCalled();
  });

});
