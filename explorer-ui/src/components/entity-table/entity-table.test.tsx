import React from 'react';
import { mount } from 'enzyme';
import EntityTable from './entity-table';
import { entityFromJSON } from '../../util/data-conversion';
import MockEntities from '../../assets/mock-data/model-response';

describe("Entity Table component", () => {
    let wrapper;

    beforeAll(() => {
        let entites = entityFromJSON(MockEntities);
        wrapper = mount(<EntityTable entities={entites}/>)
    });

    it("entity table renders", () => {
      expect(wrapper.exists('.entity-table')).toBe(true);
    });
})
