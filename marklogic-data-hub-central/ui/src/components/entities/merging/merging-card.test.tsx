import React from 'react';
import { render, wait, cleanup } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import userEvent from "@testing-library/user-event";

import MergingCard from './merging-card';

import { mergingStep } from '../../../assets/mock-data/curation/merging';
import { customerEntityDef} from '../../../assets/mock-data/curation/entity-definitions-mock';
import { SecurityTooltips } from '../../../config/tooltips.config';

const mergingStepsArray = mergingStep.artifacts;

describe('Merging cards view component', () => {

  afterEach(() => {
    cleanup();
  });
  
  it('can render/edit merging steps with writeMatchMerge authority', () => {
    const deleteMergingArtifact = jest.fn(() => {});
    const { getByText, getByLabelText, getByTestId, queryAllByRole } =  render(
      <Router>
        <MergingCard
          mergingStepsArray={mergingStepsArray}
          flows={[]}
          entityName={customerEntityDef.info.title}
          deleteMergingArtifact={deleteMergingArtifact}
          createMergingArtifact={jest.fn()}
          canReadMatchMerge={true}
          canWriteMatchMerge={true}
          entityModel={customerEntityDef.definitions}
          addStepToFlow={jest.fn()}
          addStepToNew={jest.fn()}
        />
      </Router>
    );

    expect(getByLabelText('icon: plus-circle')).toBeInTheDocument();
    expect(getByText('mergeCustomers')).toBeInTheDocument();
    expect(getByText('mergeCustomersEmpty')).toBeInTheDocument();

    //Verify if the card renders fine
    expect(getByTestId('mergeCustomers-edit')).toBeInTheDocument();
    expect(getByTestId('mergeCustomersEmpty-edit')).toBeInTheDocument();
    expect(queryAllByRole('disabled-delete-merging')).toHaveLength(0);

    // check if delete tooltip appears and user is able to proceed with deletion of the step
    userEvent.hover(getByTestId('mergeCustomers-delete'));
    wait (() => expect(getByText('Delete')).toBeInTheDocument());
    userEvent.click(getByTestId('mergeCustomers-delete'));
    wait (() => expect(getByLabelText('delete-step-text')).toBeInTheDocument());
    userEvent.click(getByText('Yes'));
    expect(deleteMergingArtifact).toBeCalled();
  });

  it('cannot edit/delete merging step without writeMatchMerge authority', () => {
    const deleteMergingArtifact = jest.fn(() => {});
    const { getByText, getByTestId, queryAllByText, queryAllByRole, queryByLabelText } =  render(
      <Router>
        <MergingCard
          mergingStepsArray={mergingStepsArray}
          flows={[]}
          entityName={customerEntityDef.info.title}
          deleteMergingArtifact={deleteMergingArtifact}
          createMergingArtifact={jest.fn()}
          canReadMatchMerge={true}
          canWriteMatchMerge={false}
          entityModel={customerEntityDef.definitions}
          addStepToFlow={jest.fn()}
          addStepToNew={jest.fn()}
        />
      </Router>
    );

    expect(queryByLabelText('icon: plus-circle')).not.toBeInTheDocument();
    expect(getByText('mergeCustomers')).toBeInTheDocument();
    expect(getByText('mergeCustomersEmpty')).toBeInTheDocument();

    //Verify if the card renders fine
    expect(getByTestId('mergeCustomers-edit')).toBeEnabled();
    expect(getByTestId('mergeCustomersEmpty-edit')).toBeEnabled();
    expect(queryAllByRole('delete-merging')).toHaveLength(0);

    // check if delete icon displays correct tooltip when disabled
    let disabledDeleteIcon = getByTestId('mergeCustomers-disabled-delete');
    userEvent.hover(disabledDeleteIcon);
    wait (() => expect(getByText('Delete: ' + SecurityTooltips.missingPermission)).toBeInTheDocument());
    userEvent.click(disabledDeleteIcon);
    expect(queryAllByText('Yes')).toHaveLength(0);
    expect(deleteMergingArtifact).not.toBeCalled();
  });
});
