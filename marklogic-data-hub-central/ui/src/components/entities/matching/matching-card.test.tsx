import React from 'react';
import { render, wait } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import userEvent from "@testing-library/user-event";

import MatchingCard from './matching-card';

import { matchingStep } from '../../../assets/mock-data/curation/matching';
import { customerEntityDef} from '../../../assets/mock-data/curation/entity-definitions-mock';
import { MatchingStep } from '../../../types/curation-types';
import { SecurityTooltips } from '../../../config/tooltips.config';

const matchingStepsArray: MatchingStep[] = matchingStep.artifacts;

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
    );

    expect(getByText('matchCustomers')).toBeInTheDocument();
    expect(getByText('matchCustomersEmpty')).toBeInTheDocument();
  });

  it('can render/edit match steps with writeMatchMerge authority', () => {
    const deleteMatchingArtifact = jest.fn();
    const { getByText, getByLabelText, getByTestId, queryAllByRole } =  render(
      <Router>
        <MatchingCard
          matchingStepsArray={matchingStepsArray}
          flows={[]}
          entityName={customerEntityDef.info.title}
          deleteMatchingArtifact={deleteMatchingArtifact}
          createMatchingArtifact={jest.fn()}
          canReadMatchMerge={true}
          canWriteMatchMerge={true}
          entityModel={customerEntityDef.definitions}
          addStepToFlow={jest.fn()}
          addStepToNew={jest.fn()}
          canWriteFlow={jest.fn}
        />
      </Router>
    );

    expect(getByLabelText('icon: plus-circle')).toBeInTheDocument();
    expect(getByText('matchCustomers')).toBeInTheDocument();
    expect(getByText('matchCustomersEmpty')).toBeInTheDocument();

    //Verify if the card renders fine
    expect(getByTestId('matchCustomers-edit')).toBeInTheDocument();
    expect(getByTestId('matchCustomersEmpty-edit')).toBeInTheDocument();
    expect(queryAllByRole('disabled-delete-matching')).toHaveLength(0);

    // check if delete tooltip appears and user is able to proceed with deletion of the step
    userEvent.hover(getByTestId('matchCustomers-delete'));
    wait (() => expect(getByText('Delete')).toBeInTheDocument());
    userEvent.click(getByTestId('matchCustomers-delete'));
    wait (() => expect(getByLabelText('delete-step-text')).toBeInTheDocument());
    userEvent.click(getByText('Yes'));
    expect(deleteMatchingArtifact).toBeCalled();
  });

  it('cannot edit/delete match step without writeMatchMerge authority', () => {
    const deleteMatchingArtifact = jest.fn();
    const { getByText, getByTestId, queryAllByText, queryAllByRole, queryByLabelText } =  render(
      <Router>
        <MatchingCard
          matchingStepsArray={matchingStepsArray}
          flows={[]}
          entityName={customerEntityDef.info.title}
          deleteMatchingArtifact={deleteMatchingArtifact}
          createMatchingArtifact={jest.fn()}
          canReadMatchMerge={true}
          canWriteMatchMerge={false}
          entityModel={customerEntityDef.definitions}
          addStepToFlow={jest.fn()}
          addStepToNew={jest.fn()}
          canWriteFlow={jest.fn}
        />
      </Router>
    );

    expect(queryByLabelText('icon: plus-circle')).not.toBeInTheDocument();
    expect(getByText('matchCustomers')).toBeInTheDocument();
    expect(getByText('matchCustomersEmpty')).toBeInTheDocument();

    //Verify if the card renders fine
    expect(getByTestId('matchCustomers-edit')).toBeEnabled();
    expect(getByTestId('matchCustomersEmpty-edit')).toBeEnabled();
    expect(queryAllByRole('delete-matching')).toHaveLength(0);

    // check if delete icon displays correct tooltip when disabled
    let disabledDeleteIcon = getByTestId('matchCustomers-disabled-delete');
    userEvent.hover(disabledDeleteIcon);
    wait (() => expect(getByText('Delete: ' + SecurityTooltips.missingPermission)).toBeInTheDocument());
    userEvent.click(disabledDeleteIcon);
    expect(queryAllByText('Yes')).toHaveLength(0);
    expect(deleteMatchingArtifact).not.toBeCalled();
  });
});
