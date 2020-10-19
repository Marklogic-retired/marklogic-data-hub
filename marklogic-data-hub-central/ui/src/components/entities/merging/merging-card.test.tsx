import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import userEvent from "@testing-library/user-event";

import MergingCard from './merging-card';

import { mergingStep } from '../../../assets/mock-data/curation/merging';
import { customerEntityDef} from '../../../assets/mock-data/curation/entity-definitions-mock';

const mergingStepsArray = mergingStep.artifacts;

describe('Merging cards view component', () => {
  it('can render merging steps', () => {
    const { getByText } =  render(
      <Router>
        <MergingCard
          mergingStepsArray={mergingStepsArray}
          flows={[]}
          entityName={customerEntityDef.info.title}
          deleteMergingArtifact={jest.fn()}
          createMergingArtifact={jest.fn()}
          canReadMatchMerge={true}
          canWriteMatchMerge={true}
          entityModel={customerEntityDef.definitions}
          addStepToFlow={jest.fn()}
          addStepToNew={jest.fn()}
        />
      </Router>
    );

    expect(getByText('mergeCustomers')).toBeInTheDocument();
    expect(getByText('mergeCustomersEmpty')).toBeInTheDocument();
  });
});
