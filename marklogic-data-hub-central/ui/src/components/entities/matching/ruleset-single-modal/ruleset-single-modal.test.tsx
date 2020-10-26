import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";

import RulesetSingleModal from './ruleset-single-modal';

import { CurationContext } from '../../../../util/curation-context';
import { customerMatchingStep } from '../../../../assets/mock-data/curation-context-mock';

describe('Matching Ruleset Single Modal component', () => {
  it('can select an property to match and match type and click cancel', () => {
    const toggleModalMock = jest.fn();

    const { queryByText, getByText, getByPlaceholderText, rerender } =  render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal 
          isVisible={false}
          toggleModal={toggleModalMock}
          saveMatchRuleset={jest.fn()}
        />
      </CurationContext.Provider>
    );

    expect(queryByText('Add Match Ruleset for Single Property')).toBeNull();

    rerender(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal 
          isVisible={true}
          toggleModal={toggleModalMock}
          saveMatchRuleset={jest.fn()}
        />
      </CurationContext.Provider>
    );

    expect(queryByText('Add Match Ruleset for Single Property')).toBeInTheDocument();
    userEvent.click(screen.getByText('Select property'));
    userEvent.click(screen.getByText('customerId'));

    userEvent.click(screen.getByText('Select match type'));
    userEvent.click(screen.getByText('Exact'));

    userEvent.click(getByText('Cancel'));
    expect(toggleModalMock).toHaveBeenCalledTimes(1);
  });
});
