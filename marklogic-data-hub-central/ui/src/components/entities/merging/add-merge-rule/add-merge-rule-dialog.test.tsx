import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import AddMergeRuleDialog from './add-merge-rule-dialog';
import data from "../../../../assets/mock-data/curation/merging.data";
import { CurationContext } from '../../../../util/curation-context';
import { customerMergingStep } from '../../../../assets/mock-data/curation/curation-context-mock';

describe('Add Merge Rule Dialog component', () => {

  afterEach(cleanup);

  test('Verify Add Merge Rule dialog renders correctly', () => {
    const { getByText, getByTestId, getByLabelText, queryByLabelText } = render(
    <CurationContext.Provider value={customerMergingStep}>
        <AddMergeRuleDialog
          {...data.mergingDataProps}
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

    //Confirming that URI, function and namespace fields are not available now, because Custom merge type is not selected yet.
    expect(queryByLabelText('uri-input')).not.toBeInTheDocument();
    expect(queryByLabelText('function-input')).not.toBeInTheDocument();
    expect(queryByLabelText('namespace-input')).not.toBeInTheDocument();

    //Selecting the merge type to Custom
    fireEvent.click(getByLabelText('mergeType-select'));
    fireEvent.click(getByTestId('mergeTypeOptions-Custom'));

    //Initializing the required elements to be re-used later.
    let uri = getByLabelText('uri-input');
    let functionValue = getByLabelText('function-input');
    let saveButton = getByText('Save');

    //Checking if URI, function and namespace fields are available now, since merge type is Custom.
    expect(uri).toBeInTheDocument();
    expect(functionValue).toBeInTheDocument();
    expect(getByLabelText('namespace-input')).toBeInTheDocument();

    fireEvent.click(saveButton); //Will throw an error because URI and Function are mandatory fields.

    //verify if the below error messages are displayed properly
    expect(getByText('URI is required')).toBeInTheDocument();
    expect(getByText('Function is required')).toBeInTheDocument();

    //Enter the values for URI and Function fields and see if the save button gets enabled.
    fireEvent.change(uri, { target: {value: 'Customer/Cust1.json'}});
    fireEvent.change(functionValue, { target: {value: 'Compare'}});

    fireEvent.click(saveButton); //Modal will close now
    expect(data.mergingDataProps.setOpenAddMergeRuleDialog).toHaveBeenCalledTimes(1);
});

});
