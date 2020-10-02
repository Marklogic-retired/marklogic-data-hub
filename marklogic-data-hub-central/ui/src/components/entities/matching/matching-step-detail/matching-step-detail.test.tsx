import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";

import MatchingStepDetail from './matching-step-detail';

import { CurationContext } from '../../../../util/curation-context';
import { customerMatchingStep, customerMatchingStepEmpty } from '../../../../assets/mock-data/curation-context-mock';

describe('Matching Step Detail view component', () => {
  it('can render matching step with no rulesets or thresholds and click less/more text', () => {

    const { getByLabelText, getByText, queryByLabelText } =  render(
      <CurationContext.Provider value={customerMatchingStepEmpty}>
        <MatchingStepDetail/>
      </CurationContext.Provider>
    )

    expect(queryByLabelText('threshold-more')).toBeNull();
    expect(queryByLabelText('ruleset-more')).toBeNull();

    userEvent.click(getByLabelText('threshold-less'));
    expect(queryByLabelText('threshold-more')).toBeInTheDocument();

    userEvent.click(getByLabelText('ruleset-less'));
    expect(queryByLabelText('ruleset-more')).toBeInTheDocument();
  });

  it('can render matching step with rulesets and thresholds and click add single ruleset', () => {

    const { getByLabelText, getByText, queryByLabelText } =  render(
      <CurationContext.Provider value={customerMatchingStep}>
        <MatchingStepDetail/>
      </CurationContext.Provider>
    )

    expect(queryByLabelText('threshold-more')).toBeInTheDocument();
    expect(queryByLabelText('ruleset-more')).toBeInTheDocument();

    userEvent.click(getByLabelText('add-ruleset'));
    userEvent.click(getByLabelText('single-ruleset-menu'));
    expect(screen.getByText('Select property')).toBeInTheDocument();
  });
});
