import React from 'react';
import { mount } from 'enzyme';
import EntityTable from './entity-table';
import { entityFromJSON } from '../../util/data-conversion';
import MockEntities from '../../assets/mock-data/model-response';
import EntityProperties from '../../assets/mock-data/entity-properties';

describe("Entity Table component", () => {
    let wrapper;

    beforeAll(() => {
        let entites = entityFromJSON(MockEntities);
        wrapper = mount(<EntityTable entities={entites} facetValues={EntityProperties.Collection.facetValues}/>)
    });

    it("entity table renders", () => {
      expect(wrapper.exists('.entity-table')).toBe(true);
    });
})
