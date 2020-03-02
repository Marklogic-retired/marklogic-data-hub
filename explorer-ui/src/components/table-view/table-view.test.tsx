import React from 'react';
import { mount } from 'enzyme';
import TableView from '../../components/table-view/table-view';
import jsonDocPayload from '../../assets/mock-data/json-document-payload';


describe("Table view component", () => {
    let wrapper;
    describe('Using JSON document payload', () => {
      beforeEach(() => {
        wrapper = mount(<TableView document={jsonDocPayload.content} contentType="json" />)
      });
  
      test("renders", () => {
        expect(wrapper.exists()).toBe(true);
      }); 

      test("table view renders", () => {
        expect(wrapper.find('.ant-table-tbody')).toHaveLength(1);
      }); 
    });
    // TODO add XML test cases
})
