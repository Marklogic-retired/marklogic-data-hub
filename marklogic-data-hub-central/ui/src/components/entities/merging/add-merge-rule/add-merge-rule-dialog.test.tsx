import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import AddMergeRuleDialog from './add-merge-rule-dialog';
import mergingData from "../../../../assets/mock-data/merging.data";
import { CurationContext } from '../../../../util/curation-context';
import { customerMergingStep } from '../../../../assets/mock-data/curation-context-mock';

describe('Add Merge Rule Dialog component', () => {

  afterEach(cleanup);

  test('Verify Add Merge Rule dialog renders correctly', () => {
    const { getByText, getByTestId, getByLabelText } = render(
    <CurationContext.Provider value={customerMergingStep}>
        <AddMergeRuleDialog
          {...mergingData}
        />
      </CurationContext.Provider>
    );

    expect(getByText('Add Merge Rule')).toBeInTheDocument();
    expect(getByText('Select the property and the merge type for this merge rule. When you select a structured type property, the merge rule is applied to all the properties within that structured type property as well.')).toBeInTheDocument();
    expect(getByTestId('multipleIconLegend')).toBeInTheDocument();
    expect(getByTestId('structuredIconLegend')).toBeInTheDocument();
    expect(getByLabelText('formItem-Property')).toBeInTheDocument();

    fireEvent.click(getByText('Select property'));
    fireEvent.click(getByText('customerId'));
    fireEvent.click(getByText('Cancel'));
    expect(mergingData.setOpenAddMergeRuleDialog).toHaveBeenCalledTimes(1);

    expect(getByText('Save')).toBeInTheDocument();
    expect(getByLabelText('Close')).toBeEnabled();
});

})