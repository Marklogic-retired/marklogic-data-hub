import React from 'react';
import { shallow } from 'enzyme';
import MappingCard from './mapping-card';

describe('Mapping cards view component', () => {
  it('should render correctly', () => {
    shallow(<MappingCard data deleteMappingArtifact
      createMappingArtifact
      canReadOnly
      canReadWrite/>);
  });
});