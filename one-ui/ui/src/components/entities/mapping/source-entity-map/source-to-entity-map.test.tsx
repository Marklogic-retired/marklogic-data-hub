import React from 'react';
import { shallow } from 'enzyme';
import SourceToEntityMap from './source-to-entity-map';

describe('Source to entity mapping dialog component', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = shallow(<SourceToEntityMap data/>)
  });

  test('Source to Entity Mapping dialog renders ', () => {
    expect(wrapper.find('#srcContainer').length).toEqual(1)
    expect(wrapper.find('#srcDetails').length).toEqual(1)
    expect(wrapper.find('#entityContainer').length).toEqual(1)
    expect(wrapper.find('#noData').length).toEqual(1)
    expect(wrapper.find('#dataPresent').length).toEqual(0)
    expect(wrapper.find('#successMessage').length).toEqual(1)
    expect(wrapper.find('#errorMessage').length).toEqual(1)
    expect(wrapper.find('#listIcon').length).toEqual(1)
    expect(wrapper.find('#functionIcon').length).toEqual(1)
  });
});