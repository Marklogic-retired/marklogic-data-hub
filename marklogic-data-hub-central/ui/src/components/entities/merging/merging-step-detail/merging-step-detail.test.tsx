import React from 'react';
import {render} from '@testing-library/react';
import { CurationContext } from '../../../../util/curation-context';
import { customerMergingStep, customerMergingStepEmpty } from '../../../../assets/mock-data/curation/curation-context-mock';
import MergingStepDetail from "./merging-step-detail";

describe('Merging Step Detail view component', () => {
    it('can render merging step with no strategies or merge rules', () => {

        const { getByText, getAllByText } =  render(
            <CurationContext.Provider value={customerMergingStepEmpty}>
                <MergingStepDetail/>
            </CurationContext.Provider>

        );
        expect(getByText('mergeCustomersEmpty')).toBeInTheDocument();
        expect(getByText('Define merge strategies')).toBeInTheDocument();
        expect(getByText('Add merge rules')).toBeInTheDocument();
        expect(getAllByText(/No Data/i)).toHaveLength(2);
    });

    it('can render merging step with merge strategies and rulesets', async() => {

        const { getByText, getAllByText, getAllByLabelText } =  render(
            <CurationContext.Provider value={customerMergingStep}>
                <MergingStepDetail/>
            </CurationContext.Provider>
        );
        expect(getByText('mergeCustomers')).toBeInTheDocument();
        //Verify Merge Strategies table is rendered with data
        // Check table column headers are rendered
        expect(getByText('Strategy Name')).toBeInTheDocument();
        expect(getByText('Max Values')).toBeInTheDocument();
        expect(getByText('Max Sources')).toBeInTheDocument();
        expect(getAllByText('Delete')).toHaveLength(2);

        //check table data is rendered correctly
        expect(getByText('customMergeStrategy')).toBeInTheDocument();

        //Verify merge rules table is rendered with data
        // Check table column headers are rendered
        expect(getByText('Property')).toBeInTheDocument();
        expect(getByText('Merge Type')).toBeInTheDocument();
        expect(getByText('Strategy')).toBeInTheDocument();

        //check table data is rendered correctly
        expect(getByText('name')).toBeInTheDocument();
        expect(getByText('address')).toBeInTheDocument();
        expect(getByText('phone')).toBeInTheDocument();
        expect(getByText('strategy')).toBeInTheDocument();
        expect(getByText('custom')).toBeInTheDocument();
        expect(getByText('property-specific')).toBeInTheDocument();
    });
});
