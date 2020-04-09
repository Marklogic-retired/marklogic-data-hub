import React from 'react';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import ProjectName from './project-name';

describe('Project Name component', () => {
  let wrapper;

  beforeAll(() => {
    wrapper = mount(
      <Router>
        <ProjectName name="test-name"/>
      </Router>
    );
  });

  it('should render correctly', () => {
    expect(wrapper.exists('#project-name')).toBe(true);
  });
});