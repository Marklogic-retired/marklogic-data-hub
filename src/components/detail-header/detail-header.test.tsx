import React from 'react';
import { mount } from 'enzyme';
import DetailHeader from './detail-header';
import jsonDocPayload from '../../assets/mock-data/json-document-payload';

describe("Detail component", () => {
  let wrapper;

  describe('Using JSON document payload', () => {
    beforeEach(() => {
      wrapper = mount(<DetailHeader document={jsonDocPayload.content} contentType="json"/>)
    });

    test("component renders", () => {
      expect(true).toBe(true);
      expect(wrapper.exists('#header')).toBe(true);
      expect(wrapper.exists('#title')).toBe(true);
      expect(wrapper.exists('#summary')).toBe(true);
    });
  
    test("data renders", () => {
      expect(wrapper.exists('[data-cy="document-title"]')).toBe(true);
      expect(wrapper.exists('[data-cy="document-timestamp"]')).toBe(true);
      expect(wrapper.exists('[data-cy="document-source"]')).toBe(true);
      expect(wrapper.exists('[data-cy="document-filetype"]')).toBe(true);
    });
  });
  // TODO add test case for XML data
});
