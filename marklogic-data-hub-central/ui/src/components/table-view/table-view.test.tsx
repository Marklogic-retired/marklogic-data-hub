import React from 'react';
import { mount } from 'enzyme';
import TableView from './table-view';
import jsonDocPayload from '../../assets/mock-data/explore/json-document-payload';
import { render } from '@testing-library/react';

describe("Table view component", () => {
    let wrapper;
    describe('Using JSON document payload', () => {
      beforeEach(() => {
        wrapper = mount(<TableView document={jsonDocPayload.data.envelope.instance.Product} contentType="json" />);
      });

      test("renders", () => {
        expect(wrapper.exists()).toBe(true);
      });

      test("table view renders", () => {
        expect(wrapper.find('.ant-table-tbody')).toHaveLength(1);
      });
    });
    // TODO add XML test cases
});

describe("Table view detail component - RTL", () => {
  test('Table detail view with No data renders', async () => {
      const {  getByText } = render(
        <TableView document={{}} contentType="json" />
      );
      // Check for Empty Table
      expect(getByText(/No Data/i)).toBeInTheDocument();
  });

});
