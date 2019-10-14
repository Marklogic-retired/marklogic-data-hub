import React from 'react';
import { mount } from 'enzyme';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import EntityTable from './entity-table';
import { entityFromJSON } from '../../util/data-conversion';
import MockEntities from '../../assets/mock-data/model-response';
import EntityProperties from '../../assets/mock-data/entity-properties';
import latestJobs from  '../../assets/mock-data/jobs';

describe("Entity Table component", () => {
    let wrapper;

    beforeAll(() => {
        let entites = entityFromJSON(MockEntities);
        wrapper = mount(
          <Router>
            <EntityTable
              entities={entites} 
              facetValues={EntityProperties.Collection.facetValues}
              lastHarmonized={latestJobs}
             />
          </Router>
        )
    });

    it("entity table renders", () => {
      expect(wrapper.exists('.entity-table')).toBe(true);
    });
})
