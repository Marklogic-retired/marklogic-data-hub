import React from 'react';
import {render, screen, fireEvent, waitForElement} from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import MatchingStepDetail from './matching-step-detail';

import { CurationContext } from '../../../../util/curation-context';
import { customerMatchingStep, customerMatchingStepEmpty } from '../../../../assets/mock-data/curation/curation-context-mock';


describe('Matching Step Detail view component', () => {
  it('can render matching step with no rulesets or thresholds and click less/more text', () => {

    const { getByLabelText, queryByLabelText, getByTestId } =  render(
      <CurationContext.Provider value={customerMatchingStepEmpty}>
        <MatchingStepDetail/>
      </CurationContext.Provider>
    );

    expect(queryByLabelText('threshold-more')).toBeNull();
    expect(queryByLabelText('ruleset-more')).toBeNull();
    expect(getByTestId('threshold-slider-rail')).toBeInTheDocument();
    expect(getByTestId('threshold-slider-options')).toBeInTheDocument();
    expect(getByTestId('ruleSet-slider-rail')).toBeInTheDocument();
    expect(getByTestId('ruleSet-slider-options')).toBeInTheDocument();

    userEvent.click(getByLabelText('threshold-less'));
    expect(queryByLabelText('threshold-more')).toBeInTheDocument();

    userEvent.click(getByLabelText('ruleset-less'));
    expect(queryByLabelText('ruleset-more')).toBeInTheDocument();
  });

  it('can render matching step with rulesets and thresholds and click add single ruleset', async() => {

    const { getByLabelText, getByText, queryByLabelText, getByTestId, debug } =  render(
      <CurationContext.Provider value={customerMatchingStep}>
        <MatchingStepDetail/>
      </CurationContext.Provider>
    );

    expect(queryByLabelText('threshold-more')).toBeInTheDocument();
    expect(queryByLabelText('ruleset-more')).toBeInTheDocument();
    //Verify threshold options are rendered on the slider
    expect(getByText('sameThreshold')).toBeInTheDocument();
    expect(getByText('similarThreshold')).toBeInTheDocument();
    expect(getByText('household')).toBeInTheDocument();

    userEvent.click(getByLabelText('add-ruleset'));
    userEvent.click(getByLabelText('single-ruleset-menu'));
    //Verify ruleset options are rendered on the slider
    expect(getByText('name')).toBeInTheDocument();
    expect(getByText('lastName')).toBeInTheDocument();
    expect(getByText('billingAddress')).toBeInTheDocument();
    expect(getByText('shippingAddress')).toBeInTheDocument();

    //Verify tooltips are highlighted on hover
    //TODO in e2e
   /* userEvent.hover(getByTestId('sameThreshold-tooltip'));
    await(waitForElement(() => expect(getByTestId('sameThreshold-tooltip')).toHaveStyle({backgroundColor:'#444'})))
    expect(getByTestId('sameThreshold-tooltip')).toHaveStyle('background-color: rgb(233, 247, 254)');*/

    //Verify handles are draggable
    fireEvent.dragStart(screen.getByTestId('sameThreshold-active'), { clientX: 0, clientY: 0 });
    fireEvent.drop(screen.getByTestId('sameThreshold-active'),{ clientX: 0, clientY: 1 });
    expect(screen.getByText('Select property')).toBeInTheDocument();
  });
});
