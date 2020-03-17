import React from 'react';
import { shallow } from 'enzyme';
import MatchingCard from './matching-card';

describe('Matching cards view component', () => {
  it('should render correctly', () => {
    shallow(<MatchingCard data deleteMatchingArtifact entityName
      createMatchingArtifact
      canReadMatchMerge
      canWriteMatchMerge/>);
  });
});
