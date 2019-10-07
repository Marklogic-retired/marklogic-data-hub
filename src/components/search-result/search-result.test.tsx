import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { mount } from 'enzyme';
import SearchResult from './search-result';
import { entityFromJSON, entityParser } from '../../util/data-conversion';
import modelResponse from '../../assets/mock-data/model-response';
import searchPayloadResults from '../../assets/mock-data/search-payload-results';

describe("Search Result component", () => {
    let wrapper;
    const parsedModelData = entityFromJSON(modelResponse);
    const entityDefArray = entityParser(parsedModelData);

    describe('JSON result with Primary Key', () => {
      beforeEach(() => {
        wrapper = mount(
          <Router>
            <SearchResult
              entityDefArray={entityDefArray}
              item={searchPayloadResults[0]}
            />
          </Router>
        )
      });
  
      it('should render entity name', () => {
        expect(wrapper.exists('[data-cy="entity-name"]')).toBe(true);
      });
      it('should render primary key', () => {
        expect(wrapper.exists('[data-cy="primary-key"]')).toBe(true);
      });
      it('should render snippet info', () => {
        expect(wrapper.exists('[data-cy="snipped"]')).toBe(true);
      });
      it('should render meta data', () => {
        expect(wrapper.exists('[data-cy="created-on"]')).toBe(true);
        expect(wrapper.exists('[data-cy="sources"]')).toBe(true);
        expect(wrapper.exists('[data-cy="file-type"]')).toBe(true);
      });
    });

    // TODO Add more test cases for XML, with and without Primary key defined
})
