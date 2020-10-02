import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import userEvent from "@testing-library/user-event";

import MatchingCard from './matching-card';

import { matchingStep } from '../../../assets/mock-data/matching';
import { customerEntityDef} from '../../../assets/mock-data/entity-definitions-mock';
import { MatchingStep } from '../../../types/curation-types'

const matchingStepsArray: MatchingStep[] = matchingStep.artifacts


describe('Matching cards view component', () => {
  it('can render matching steps', () => {
    const { getByText } =  render(
      <Router>
        <MatchingCard 
          matchingStepsArray={matchingStepsArray}
          flows={[]}
          entityName={customerEntityDef.info.title}
          deleteMatchingArtifact={jest.fn()}
          createMatchingArtifact={jest.fn()}
          canReadMatchMerge={true}
          canWriteMatchMerge={true}
          entityModel={customerEntityDef.definitions}
          canWriteFlow={true}
          addStepToFlow={jest.fn()}
          addStepToNew={jest.fn()}
        />
      </Router>
    )

    expect(getByText('matchCustomers')).toBeInTheDocument()
    expect(getByText('matchCustomersEmpty')).toBeInTheDocument()
  });
});
