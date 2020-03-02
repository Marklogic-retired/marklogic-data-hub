import React from 'react';
import { shallow } from 'enzyme';
import Sidebar from './sidebar';
import { entityFromJSON, entityParser } from '../../util/data-conversion';
import modelResponse from '../../assets/mock-data/model-response';
import searchPayloadFacets from '../../assets/mock-data/search-payload-facets';

describe("Sidebar component", () => {
    let wrapper;
    const parsedModelData = entityFromJSON(modelResponse);
    const entityDefArray = entityParser(parsedModelData);

    describe('All Entities Dropdown Option', () => {
      beforeEach(() => {
        wrapper = shallow(
          <Sidebar
            entityDefArray={entityDefArray}
            facets={searchPayloadFacets}
            selectedEntities={[]}
          />
        )
      });
  
      it('should render only Hub Properties Panel', () => {
        expect(wrapper.exists('#hub-properties')).toBe(true);
        expect(wrapper.exists('#entity-properties')).toBe(false);
      });
    });

    describe('An Entity is selected', () => {
      beforeEach(() => {
        wrapper = shallow(
          <Sidebar
            entityDefArray={entityDefArray}
            facets={searchPayloadFacets}
            selectedEntities={['Customer']}
          />
        )
      });
  
      it('should render both Entity and Hub Properties panel', () => {
        expect(wrapper.exists('#hub-properties')).toBe(true);
        expect(wrapper.exists('#entity-properties')).toBe(true);
      });
    });
})
