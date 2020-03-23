import React from 'react';
import { shallow } from 'enzyme';
import SourceToEntityMap from './source-to-entity-map';
import data from '../../../../config/data.config';

describe('Source to Entity mapping component', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = shallow(<SourceToEntityMap {...data.mapProps} />);
  });

  test('Modal renders properly', () => {
      //Use console.log(wrapper.debug()) for debugging the html returned by the wrapper;
      expect(wrapper.find('#srcContainer').length).toEqual(1);
      expect(wrapper.find('#srcDetails').length).toEqual(1);
      expect(wrapper.find('#entityContainer').length).toEqual(1);
      expect(wrapper.find('#noData').length).toEqual(0);
      expect(wrapper.find('#dataPresent').length).toEqual(1);
      //Success and Error message are shown only when a mapping expression is being saved
      expect(wrapper.find('#successMessage').length).toEqual(0);
      expect(wrapper.find('#errorMessage').length).toEqual(0);
      //List and Function icon are displayed only when the entity table loads with entity properties
      expect(wrapper.find('#listIcon').length).toEqual(0);
      expect(wrapper.find('#functionIcon').length).toEqual(0);
      expect(wrapper.find('#Clear-btn').length).toEqual(1);
      expect(wrapper.find('#Test-btn').length).toEqual(1);
      expect(wrapper.find('#errorInExp').length).toEqual(0);
      expect(wrapper.find('#valuesAfterTest').length).toEqual(0);
  });

  test('Modal renders a message when there is no source data', () => {
      let noDataMessage = "Unable to find source documents using the specified collection or query." +
          "Load some data that mapping can use as reference and/or edit the step settings to use a " +
          "source collection or query that will return some results.";
      wrapper.setProps({sourceData: []} );
      expect(wrapper.find('#noData').length).toEqual(1);
      expect(wrapper.find('.emptyText').text().includes(noDataMessage)).toBeTruthy();
      expect(wrapper.find('#dataPresent').length).toEqual(0);
  });
});
