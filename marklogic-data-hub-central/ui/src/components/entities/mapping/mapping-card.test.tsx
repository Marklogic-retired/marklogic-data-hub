import React from 'react';
import { shallow } from 'enzyme';
import MappingCard from './mapping-card';

describe('Mapping cards view component', () => {
  it('should render correctly', () => {
    shallow(<MappingCard data 
      entityTypeTitle
      getMappingArtifactByMapName
      deleteMappingArtifact
      createMappingArtifact
      updateMappingArtifact
      canReadOnly
      canReadWrite
      entityModel/>);
  });
});