import React from 'react';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import { entityFromJSON, entityParser } from '../../util/data-conversion';
import modelResponse from '../../assets/mock-data/model-response';
import searchPayloadResults from '../../assets/mock-data/search-payload-results';
import ResultTable from './result-table';

describe("Result Table component", () => {
  let wrapper;
  const parsedModelData = entityFromJSON(modelResponse);
  const entityDefArray = entityParser(parsedModelData);

  describe('Result Table for all entities', () => {
    beforeEach(() => {
      wrapper = mount(
        <Router>
          <ResultTable
            data={searchPayloadResults}
            entityDefArray={entityDefArray}
          />
        </Router>
      )
    });

    it('should render table', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('should render table for all entities', () => {
      expect(wrapper.find('.ant-table-thead th')).toHaveLength(6);
    });

    it('should render resizable', () => {
      expect(wrapper.find('.react-resizable')).toHaveLength(5);
      expect(wrapper.find('.react-resizable-handle')).toHaveLength(5);
    });
  });

  describe('Result Table for the entity', () => {
    // TODO this test is the same as for all entities
    beforeEach(() => {
      wrapper = mount(
        <Router>
          <ResultTable
            data={searchPayloadResults}
            entityDefArray={entityDefArray}
          />
        </Router>
      )
    });

    it('should render table', () => {
      expect(wrapper.exists()).toBe(true);
    });
 
    it('should render table for the entity', () => {
      expect(wrapper.find('.ant-table-thead th')).toHaveLength(6);
    });

    it('should render resizable', () => {
      expect(wrapper.find('.react-resizable')).toHaveLength(5);
      expect(wrapper.find('.react-resizable-handle')).toHaveLength(5);
    });
  });
})