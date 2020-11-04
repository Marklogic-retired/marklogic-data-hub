import React from 'react';
import {render, cleanup, fireEvent, getByLabelText} from '@testing-library/react';
import data from "../../../../assets/mock-data/curation/merging.data";
import { CurationContext } from '../../../../util/curation-context';
import { customerMergingStep } from '../../../../assets/mock-data/curation/curation-context-mock';
import EditMergeStrategyDialog from "./edit-merge-strategy-dialog";

describe('Edit Merge Strategy Dialog component', () => {

    afterEach(cleanup);

    test('Verify Edit Merge Strategy dialog renders correctly with priority order options', () => {
        const { getByText, getByPlaceholderText, getByTestId, getByLabelText } = render(
            <CurationContext.Provider value={customerMergingStep}>
                <EditMergeStrategyDialog
                    {...data.editMergingDataProps}
                    strategyName={'myFavouriteSource'}
                />
            </CurationContext.Provider>
        );

        expect(getByText('Edit Strategy')).toBeInTheDocument();
        let strategyText = getByPlaceholderText("Enter strategy name");
        expect(strategyText).toHaveAttribute('value', 'myFavouriteSource');
        fireEvent.change(strategyText, { target: {value: ''}});
        //verify if the below error message is displayed properly
        expect(getByText('Strategy name is required')).toBeInTheDocument();
        expect(getByPlaceholderText('Enter max values')).toBeInTheDocument();
        expect(getByPlaceholderText('Enter max sources')).toBeInTheDocument();
        expect(getByTestId('prioritySlider')).toBeInTheDocument();
        expect(getByLabelText('add-slider-button')).toBeInTheDocument();
        let saveButton = getByText('Save');
        //Modal will close now
        fireEvent.click(saveButton);
        expect(data.editMergingDataProps.setOpenEditMergeStrategyDialog).toHaveBeenCalledTimes(1);
    });

    test('Verify Edit Merge Strategy dialog renders correctly for custom step', () => {
        const { getByText, getByPlaceholderText } = render(
            <CurationContext.Provider value={customerMergingStep}>
                <EditMergeStrategyDialog
                    {...data.editMergingDataProps}
                    strategyName={'customMergeStrategy'}
                />
            </CurationContext.Provider>
        );

        expect(getByText('Edit Strategy')).toBeInTheDocument();
        let strategyText = getByPlaceholderText("Enter strategy name");
        expect(strategyText).toHaveAttribute('value', 'customMergeStrategy');
    });

});
