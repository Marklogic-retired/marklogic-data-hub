import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import CreateEditMatchingDialog from './create-edit-matching-dialog';
import data from "../../../../assets/mock-data/matching.data";

describe('Create/Edit Matching artifact component', () => {

    afterEach(cleanup);

    test('Verify Edit Matching dialog renders correctly for a read only user', () => {
        const { getByText, getByPlaceholderText, getByLabelText } = render(<CreateEditMatchingDialog {...data.editMatching} canReadOnly={true} canReadWrite={false}/>);

        expect(getByPlaceholderText('Enter name')).toHaveValue('testMatching');
        expect(getByPlaceholderText('Enter name')).toBeDisabled();
        expect(getByPlaceholderText('Enter description')).toHaveValue('Description of testMatching');
        expect(getByPlaceholderText('Enter description')).toBeDisabled();
        expect(getByLabelText('Collection')).toBeChecked();
        expect(getByLabelText('Collection')).toBeDisabled();
        expect(getByLabelText('Query')).toBeDisabled();
        expect(getByPlaceholderText('Please select')).toBeDisabled();

        expect(getByText('Save')).toBeDisabled();
        expect(getByText('Cancel')).toBeEnabled();
        expect(getByLabelText('Close')).toBeEnabled();
    });

    test('Verify New Matching Dialog renders ', () => {
        const { getByText, getByLabelText, getByPlaceholderText } = render(<CreateEditMatchingDialog {...data.newMatching} />);

        expect(getByText('New Matching')).toBeInTheDocument();
        expect(getByPlaceholderText('Enter name')).toBeInTheDocument();
        expect(getByPlaceholderText('Enter description')).toBeInTheDocument();
        expect(getByLabelText('Collection')).toBeInTheDocument();
        expect(getByLabelText('Query')).toBeInTheDocument();
        expect(getByPlaceholderText('Please select')).toBeInTheDocument();
        expect(getByText('Save')).toBeDisabled();
        expect(getByText('Cancel')).toBeEnabled();
        //Collection radio button should be selected by default
        expect(getByLabelText('Collection')).toBeChecked();
    });

    test('Verify matching name is mandatory and Save button is disabled', () => {
        const { getByText, getByPlaceholderText } = render(<CreateEditMatchingDialog {...data.newMatching} />);
        const nameInput = getByPlaceholderText('Enter name');
        const saveButton = getByText('Save');

        fireEvent.change(nameInput, { target: {value: 'testCreateMatching'}});
        expect(nameInput).toHaveValue('testCreateMatching');
        expect(saveButton).toBeEnabled();

        fireEvent.change(nameInput, { target: {value: ''}});
        expect(getByText('Name is required')).toBeInTheDocument();
        expect(saveButton).toBeDisabled();
    });

    test('Verify able to type in input fields', () => {
        const { getByText, getByLabelText, getByPlaceholderText } = render(<CreateEditMatchingDialog {...data.newMatching} />);

        const descInput = getByPlaceholderText('Enter description');
        const collInput = getByPlaceholderText('Please select');
        expect(collInput).toBeInTheDocument();
        const saveButton = getByText('Save');
        saveButton.onclick = jest.fn();

        fireEvent.change(descInput, { target: {value: 'test description'}});
        expect(descInput).toHaveValue('test description');
        fireEvent.change(collInput, { target: {value: 'testCollection'}});
        expect(collInput).toHaveValue('testCollection');
        fireEvent.click(getByLabelText('Query'));
        const queryInput = getByPlaceholderText('Enter Source Query');
        fireEvent.change(queryInput, { target: {value: 'cts.collectionQuery(["testCollection"])'}});
        expect(queryInput).toHaveTextContent('cts.collectionQuery(["testCollection"])');
        fireEvent.click(saveButton);
        expect(saveButton.onclick).toHaveBeenCalled();

    });

    test('Verify new matching modal closes when Cancel is clicked', () => {
        const { getByText, rerender, queryByText } = render(<CreateEditMatchingDialog {...data.newMatching} />);

        expect(getByText('New Matching')).toBeInTheDocument();
        fireEvent.click(getByText('Cancel'));
        //setting newMatching to false to close the modal
        rerender(<CreateEditMatchingDialog newMatching={false}/>);
        expect(queryByText('New Matching')).not.toBeInTheDocument();
    });

    test('Verify new matching modal closes when "x" is clicked', () => {
        const { getByLabelText, getByText, rerender, queryByText } = render(<CreateEditMatchingDialog {...data.newMatching} />);
        expect(getByText('New Matching')).toBeInTheDocument();
        fireEvent.click(getByLabelText('Close'));
        rerender(<CreateEditMatchingDialog newMatching={false}/>);
        expect(queryByText('New Matching')).not.toBeInTheDocument();
    });

    test('Verify delete dialog modal when Cancel is clicked', () => {
        const { getByLabelText, getByText } = render(<CreateEditMatchingDialog {...data.newMatching} />);
        fireEvent.click(getByLabelText('Query'));
        fireEvent.click(getByText('Cancel'));
        expect(getByText('Discard changes?')).toBeInTheDocument();
        expect(getByText('Yes')).toBeInTheDocument();
    });

    test('Verify delete dialog modal when "x" is clicked', () => {
        const { getByLabelText, getByText, queryByText } = render(<CreateEditMatchingDialog {...data.newMatching} />);
        expect(getByLabelText('Query')).toBeInTheDocument();
        fireEvent.click(getByLabelText('Query'));
        fireEvent.click(getByLabelText('Close'));
        expect(queryByText('Discard changes?')).toBeInTheDocument();
        expect(getByText('Yes')).toBeInTheDocument();
        expect(getByText('No')).toBeInTheDocument();
    });

    test('Verify Edit Matching dialog renders correctly', () => {
        const { getByText, getByPlaceholderText, getByLabelText } = render(<CreateEditMatchingDialog {...data.editMatching} />);
        expect(getByPlaceholderText('Enter name')).toHaveValue('testMatching');
        expect(getByPlaceholderText('Enter name')).toBeDisabled();
        expect(getByPlaceholderText('Enter description')).toHaveValue('Description of testMatching');

        expect(getByLabelText('Collection')).toBeChecked();
        expect(getByPlaceholderText('Please select')).toHaveValue('matching-collection');

        fireEvent.click(getByLabelText('Query'));
        expect(getByPlaceholderText('Enter Source Query')).toHaveTextContent("cts.collectionQuery(['matching-collection'])");

        expect(getByText('Save')).toBeEnabled();
        expect(getByText('Cancel')).toBeEnabled();
    });

});
