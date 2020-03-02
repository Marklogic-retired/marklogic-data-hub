import React from 'react';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import ColumnSelector from './column-selector';

describe("Result Table component", () => {
  let wrapper;
  const allEntitiesModelData = [{"title":"Identifier","dataIndex":"identifier","key":"0-i","width":150},{"title":"Entity","dataIndex":"entity","key":"0-1","width":150},{"title":"File Type","dataIndex":"filetype","key":"0-2","width":150},{"title":"Created","dataIndex":"created","key":"0-c","width":150},{"title":"Detail view","dataIndex":"detailview","key":"0-d","width":150}];
  const personEntityModelData = [{"title":"id","dataIndex":"id","key":"0-0","width":150},{"title":"fname","dataIndex":"fname","key":"0-1","width":150},{"title":"lname","dataIndex":"lname","key":"0-2","width":150},{"title":"desc","dataIndex":"desc","key":"0-3","width":150},{"title":"Created","dataIndex":"created","key":"0-c","width":150},{"title":"Detail view","dataIndex":"detailview","key":"0-d","width":150}];
  const dummyFunc = () => {}

  describe('Result Table for all entities', () => {
    beforeEach(() => {
      wrapper = mount(
          <ColumnSelector
            title={allEntitiesModelData}
            tree={allEntitiesModelData}
            headerRender = {dummyFunc}
          />
      )
    });

    it('should render column selector for All Entities', () => {
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Result Table for the entity', () => {
    beforeEach(() => {
      wrapper = mount(
        <Router>
          <ColumnSelector
            title={personEntityModelData}
            tree={personEntityModelData}
            headerRender = {dummyFunc}
          />
        </Router>
      )
    });

    it('should render columns selector for Person Entity', () => {
      expect(wrapper.exists()).toBe(true);
    });
  });
})