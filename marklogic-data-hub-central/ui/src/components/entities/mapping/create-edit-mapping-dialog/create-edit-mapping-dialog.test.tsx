import React from 'react';
import { render, fireEvent, cleanup, wait } from '@testing-library/react';
import CreateEditMappingDialog from './create-edit-mapping-dialog';
import data from "../../../../assets/mock-data/curation/common.data";

describe('Create/Edit Mapping Step artifact component', () => {

  afterEach(cleanup)

  test('Verify New Mapping Step dialog renders ', () => {
    const { getByText, getByLabelText, getByPlaceholderText } = render(<CreateEditMappingDialog {...data.newMap} />);

    expect(getByText('New Mapping Step')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter name')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter description')).toBeInTheDocument();
    expect(getByLabelText('Collection')).toBeInTheDocument();
    expect(getByLabelText('Query')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter collection name')).toBeInTheDocument();
    expect(getByText('Save')).toBeDisabled();
    expect(getByText('Cancel')).toBeEnabled();
    //Collection radio button should be selected by default
    expect(getByLabelText('Collection')).toBeChecked();
  });

  test('Verify mapping name, source query is mandatory and Save button is disabled', () => {
    const { getByText, getByPlaceholderText, getByLabelText } = render(<CreateEditMappingDialog {...data.newMap} />);
    const nameInput = getByPlaceholderText('Enter name');
    const saveButton = getByText('Save');
    const collInput = getByPlaceholderText('Enter collection name');

    // Enter the value for name input.
    fireEvent.change(nameInput, { target: {value: 'testCreateMap'}});
    expect(nameInput).toHaveValue('testCreateMap');
    expect(saveButton).toBeDisabled(); // It should be disabled since no value is provided yet for Collection or Query.

    //Providing the value for Collection field now so that Save button can be enabled.
    fireEvent.change(collInput, { target: {value: 'testCollection'}});
    expect(collInput).toHaveValue('testCollection');
    expect(saveButton).toBeEnabled(); //Should be enabled now as all the mandatory fields have values.

    //Removing the value of Name field to check if getting the error what name field is required.
    fireEvent.change(nameInput, { target: {value: ''}});
    expect(getByText('Name is required')).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    //Adding the value for name field to test if Source Query /Collections fields are 'Required', in the next test case.
    fireEvent.change(nameInput, { target: {value: 'testCreateMap'}});
    expect(nameInput).toHaveValue('testCreateMap');
    expect(saveButton).toBeEnabled();

    //Removing collection field value to check if we get the validation error as 'Collection or Query is required'.
    fireEvent.change(collInput, { target: {value: ''}});
    expect(getByText('Collection or Query is required')).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    //Adding the collection value now to see if we go back to enabling the save button once collection value is provided.
    fireEvent.change(collInput, { target: {value: 'testCollection'}});
    expect(collInput).toHaveValue('testCollection');
    expect(saveButton).toBeEnabled();

    // Remove collection value first and provide a value for Query field later.
    fireEvent.change(collInput, { target: {value: ''}});
    expect(saveButton).toBeDisabled(); // Checking if the Save button is disabled again , before updating the value for Query.
    fireEvent.click(getByLabelText('Query'));  //updating the value of Query field now.
    const queryInput = getByPlaceholderText('Enter source query');
    fireEvent.change(queryInput, { target: {value: 'cts.collectionQuery(["testCollection"])'}});
    expect(saveButton).toBeEnabled(); //Should be disabled since neither Query nor Collection field has any value.

    //Removing source field value now to check if we get the validation error as 'Collection or Query is required'.
    fireEvent.change(queryInput, { target: {value: ''}});
    expect(getByText('Collection or Query is required')).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  test('Verify able to type in input fields', () => {
    const { getByText, getByLabelText, getByPlaceholderText } = render(<CreateEditMappingDialog {...data.newMap} />);

    const descInput = getByPlaceholderText('Enter description');
    const collInput = getByPlaceholderText('Enter collection name');
    const saveButton = getByText('Save');
    saveButton.onclick = jest.fn();

    fireEvent.change(descInput, { target: {value: 'test description'}});
    expect(descInput).toHaveValue('test description');
    fireEvent.change(collInput, { target: {value: 'testCollection'}});
    expect(collInput).toHaveValue('testCollection');

    fireEvent.click(getByLabelText('Query'));
    const queryInput = getByPlaceholderText('Enter source query');
    fireEvent.change(queryInput, { target: {value: 'cts.collectionQuery(["testCollection"])'}});
    expect(queryInput).toHaveTextContent('cts.collectionQuery(["testCollection"])');
    fireEvent.change(queryInput, { target: {value: 'cts.collectionQuery("testCollection")'}});
    expect(queryInput).toHaveTextContent('cts.collectionQuery("testCollection")');
    expect(collInput).toHaveValue("testCollection");
    fireEvent.change(queryInput, { target: {value: "cts.collectionQuery(['testCollection'])"}});
    expect(queryInput).toHaveTextContent("cts.collectionQuery(['testCollection'])");
    expect(collInput).toHaveValue('testCollection');
    fireEvent.change(queryInput, { target: {value: "cts.collectionQuery('testCollection')"}});
    expect(queryInput).toHaveTextContent("cts.collectionQuery('testCollection')");
    expect(collInput).toHaveValue('testCollection');
    fireEvent.click(saveButton);
    expect(saveButton.onclick).toHaveBeenCalled();

  });

  test('Verify New Mapping Step modal closes when Cancel is clicked', () => {
    const { getByText, rerender, queryByText } = render(<CreateEditMappingDialog {...data.newMap} />);

    expect(getByText('New Mapping Step')).toBeInTheDocument();
    fireEvent.click(getByText('Cancel'));
    //setting newMap to false to close the modal
    rerender(<CreateEditMappingDialog newMap={false}/>);
    //queryByText returns null and getByText throws an error. So we use queryByText to verify element not present scenarios
    expect(queryByText('New Mapping Step')).not.toBeInTheDocument();
  });

  test('Verify New Mapping Step modal closes when "x" is clicked', () => {
    const { getByLabelText, getByText, rerender, queryByText } = render(<CreateEditMappingDialog {...data.newMap} />);
    expect(getByText('New Mapping Step')).toBeInTheDocument();
    fireEvent.click(getByLabelText('Close'));
    rerender(<CreateEditMappingDialog newMap={false}/>);
    expect(queryByText('New Mapping Step')).not.toBeInTheDocument();
  });

  test('Verify delete dialog modal when Cancel is clicked', () => {
    const { getByLabelText, getByText } = render(<CreateEditMappingDialog {...data.newMap} />);
    fireEvent.click(getByLabelText('Query'));
    fireEvent.click(getByText('Cancel'));
    expect(getByText('Discard changes?')).toBeInTheDocument();
    expect(getByText('Yes')).toBeInTheDocument();
    expect(getByText('No')).toBeInTheDocument();
    /* Enhance the test later to include verification on No and Yes clicks
    fireEvent.click(getByText('No'));
    rerender(<CreateEditMappingDialog isSrcQueryTouched={false} deleteDialogVisible={false} />);
    expect(queryByText('Discard changes?')).not.toBeInTheDocument();*/
  });

  test('Verify delete dialog modal when "x" is clicked', () => {
    const { getByLabelText, getByText, queryByText } = render(<CreateEditMappingDialog {...data.newMap} />);
    fireEvent.click(getByLabelText('Query'));
    fireEvent.click(getByLabelText('Close'));
    expect(queryByText('Discard changes?')).toBeInTheDocument();
    expect(getByText('Yes')).toBeInTheDocument();
    expect(getByText('No')).toBeInTheDocument();
  });

  test('Verify Edit Mapping Step dialog renders correctly', () => {
    const { getByText, getByPlaceholderText, getByLabelText } = render(<CreateEditMappingDialog {...data.editMap} />);
    expect(getByPlaceholderText('Enter name')).toHaveValue('testMap');
    expect(getByPlaceholderText('Enter name')).toBeDisabled();
    expect(getByPlaceholderText('Enter description')).toHaveValue('Description of testMap');

    expect(getByLabelText('Collection')).toBeChecked();
    expect(getByPlaceholderText('Enter collection name')).toHaveValue('map-collection');

    fireEvent.click(getByLabelText('Query'));
    expect(getByPlaceholderText('Enter source query')).toHaveTextContent("cts.collectionQuery(['map-collection'])");

    expect(getByText('Save')).toBeEnabled();
    expect(getByText('Cancel')).toBeEnabled();
  });

  test('Verify Edit Mapping Step dialog renders correctly for a read only user', () => {
    const { getByText, getByPlaceholderText, getByLabelText } = render(<CreateEditMappingDialog {...data.editMap} canReadOnly={true} canReadWrite={false}/>);

    expect(getByPlaceholderText('Enter name')).toHaveValue('testMap');
    expect(getByPlaceholderText('Enter name')).toBeDisabled();
    expect(getByPlaceholderText('Enter description')).toHaveValue('Description of testMap');
    expect(getByPlaceholderText('Enter description')).toBeDisabled();
    expect(getByLabelText('Collection')).toBeChecked();
    expect(getByLabelText('Collection')).toBeDisabled();
    expect(getByLabelText('Query')).toBeDisabled();
    expect(getByPlaceholderText('Enter collection name')).toBeDisabled();

    expect(getByText('Save')).toBeDisabled();
    expect(getByText('Cancel')).toBeEnabled();
    expect(getByLabelText('Close')).toBeEnabled();
  });


});
