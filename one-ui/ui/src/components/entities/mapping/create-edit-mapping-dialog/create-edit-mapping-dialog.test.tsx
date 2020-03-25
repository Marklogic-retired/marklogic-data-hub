import React from 'react';
import { render, fireEvent, cleanup, wait } from '@testing-library/react';
import CreateEditMappingDialog from './create-edit-mapping-dialog';
import data from "../../../../config/data.config";

describe('Create/Edit Mapping artifact component', () => {

  afterEach(cleanup)

  test('Verify New Mapping Dialog renders ', () => {
    const { getByText, getByLabelText, getByPlaceholderText } = render(<CreateEditMappingDialog {...data.newMap} />);
   
    expect(getByText('New Mapping')).toBeInTheDocument();
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

  test('Verify mapping name is mandatory and Save button is disabled', () => {
    const { getByText, getByPlaceholderText } = render(<CreateEditMappingDialog {...data.newMap} />);
    const nameInput = getByPlaceholderText('Enter name');
    const saveButton = getByText('Save');
    
    fireEvent.change(nameInput, { target: {value: 'testCreateMap'}});
    expect(nameInput).toHaveValue('testCreateMap');
    expect(saveButton).toBeEnabled();
    
    fireEvent.change(nameInput, { target: {value: ''}});
    expect(getByText('Name is required')).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  test('Verify able to type in input fields', () => {
    const { getByText, getByLabelText, getByPlaceholderText } = render(<CreateEditMappingDialog {...data.newMap} />);
    
    const descInput = getByPlaceholderText('Enter description');
    const collInput = getByPlaceholderText('Please select');
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

  test('Verify new mapping modal closes when Cancel is clicked', () => {
    const { getByText, rerender, queryByText } = render(<CreateEditMappingDialog {...data.newMap} />);
  
    expect(getByText('New Mapping')).toBeInTheDocument();
    fireEvent.click(getByText('Cancel'));
    //setting newMap to false to close the modal
    rerender(<CreateEditMappingDialog newMap={false}/>);
    //queryByText returns null and getByText throws an error. So we use queryByText to verify element not present scenarios
    expect(queryByText('New Mapping')).not.toBeInTheDocument();
  });

  test('Verify new mapping modal closes when "x" is clicked', () => {
    const { getByLabelText, getByText, rerender, queryByText } = render(<CreateEditMappingDialog {...data.newMap} />);
    expect(getByText('New Mapping')).toBeInTheDocument();
    fireEvent.click(getByLabelText('Close'));
    rerender(<CreateEditMappingDialog newMap={false}/>);
    expect(queryByText('New Mapping')).not.toBeInTheDocument();
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

  test('Verify Edit Mapping dialog renders correctly', () => {
    const { getByText, getByPlaceholderText, getByLabelText } = render(<CreateEditMappingDialog {...data.editMap} />);
    expect(getByPlaceholderText('Enter name')).toHaveValue('testMap');
    expect(getByPlaceholderText('Enter name')).toBeDisabled();
    expect(getByPlaceholderText('Enter description')).toHaveValue('Description of testMap');

    expect(getByLabelText('Collection')).toBeChecked();
    expect(getByPlaceholderText('Please select')).toHaveValue('map-collection');

    fireEvent.click(getByLabelText('Query'));
    expect(getByPlaceholderText('Enter Source Query')).toHaveTextContent("cts.collectionQuery(['map-collection'])");

    expect(getByText('Save')).toBeEnabled();
    expect(getByText('Cancel')).toBeEnabled();
  });

  test('Verify Edit Mapping dialog renders correctly for a read only user', () => {
    const { getByText, getByPlaceholderText, getByLabelText } = render(<CreateEditMappingDialog {...data.editMap} canReadOnly={true} canReadWrite={false}/>);
  
    expect(getByPlaceholderText('Enter name')).toHaveValue('testMap');
    expect(getByPlaceholderText('Enter name')).toBeDisabled();
    expect(getByPlaceholderText('Enter description')).toHaveValue('Description of testMap');
    expect(getByPlaceholderText('Enter description')).toBeDisabled();
    expect(getByLabelText('Collection')).toBeChecked();
    expect(getByLabelText('Collection')).toBeDisabled();
    expect(getByLabelText('Query')).toBeDisabled();
    expect(getByPlaceholderText('Please select')).toBeDisabled();

    expect(getByText('Save')).toBeDisabled();
    expect(getByText('Cancel')).toBeEnabled();
    expect(getByLabelText('Close')).toBeEnabled();
  });


});
