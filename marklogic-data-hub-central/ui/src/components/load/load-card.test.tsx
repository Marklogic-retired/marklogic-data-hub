import React from 'react';
import { shallow } from 'enzyme';
import LoadCard from './load-card';

describe('Load Card component', () => {
  it('should render correctly', () => {
    shallow(<LoadCard data deleteLoadArtifact
      createLoadArtifact/>);
  });
});