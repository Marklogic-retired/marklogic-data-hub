import React from 'react';
import axiosMock from 'axios';
import { fireEvent, render, wait, cleanup } from "@testing-library/react";
import AdvancedSettingsDialog from './advanced-settings-dialog';
import data from '../../config/test-data.config';

jest.mock('axios');

describe('Update data load settings component', () => {

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test('Verify settings dialog renders for Mapping', () => {

    const { getByText, getByPlaceholderText, getByRole } = render(<AdvancedSettingsDialog {...data.advancedSettings} />);
    expect(getByText('Advanced Settings')).toBeInTheDocument();
    expect(getByText(data.advancedSettings.stepData.name)).toBeInTheDocument(); //Verify if the step name is available in the settings dialog
    expect(getByText('Source Database:')).toBeInTheDocument();
    expect(getByText('data-hub-STAGING')).toBeInTheDocument();
    expect(getByText('Target Database:')).toBeInTheDocument();
    expect(getByText('data-hub-FINAL')).toBeInTheDocument();
    //Add a check for target format once implemented
    //Should show default collections applied???
    expect(getByText('Target Collections:')).toBeInTheDocument();
    expect(getByText('Please select target collections')).toBeInTheDocument();
    expect(getByText('Default Collections:')).toBeInTheDocument();
    expect(getByText('Target Permissions:')).toBeInTheDocument();
    expect(getByText('Provenance Granularity:')).toBeInTheDocument();
    expect(getByText('Coarse-grained')).toBeInTheDocument();
    expect(getByText('Custom Hook')).toBeInTheDocument();
    fireEvent.click(getByText('Custom Hook'));
    expect(getByPlaceholderText('Please enter module')).toBeInTheDocument();
    expect(getByPlaceholderText('Please enter parameters')).toHaveValue('{}');
    expect(getByPlaceholderText('Please enter user information')).toBeInTheDocument();
    expect(getByRole('switch')).toBeInTheDocument();
    expect(getByText('OFF')).toBeInTheDocument();
  });

  test('Verify settings dialog renders for Load Data', () => {
    const { queryByText, getByText, getByPlaceholderText, getByRole } = render(<AdvancedSettingsDialog {...data.advancedSettings} activityType={'ingestion'} />);
    expect(getByText('Advanced Settings')).toBeInTheDocument();
    expect(getByText(data.advancedSettings.stepData.name)).toBeInTheDocument(); //Verify if the step name is available in the settings dialog
    expect(queryByText('Source Database:')).not.toBeInTheDocument();
    expect(getByText('Target Database:')).toBeInTheDocument();
    expect(getByText('data-hub-STAGING')).toBeInTheDocument();
    expect(getByText('Target Collections:')).toBeInTheDocument();
    expect(getByText('Please select target collections')).toBeInTheDocument();
    expect(getByText('Default Collections:')).toBeInTheDocument();
    expect(getByText('Target Permissions:')).toBeInTheDocument();
    expect(getByText('Provenance Granularity:')).toBeInTheDocument();
    expect(getByText('Coarse-grained')).toBeInTheDocument();
    expect(getByText('Custom Hook')).toBeInTheDocument();
    fireEvent.click(getByText('Custom Hook'));
    expect(getByPlaceholderText('Please enter module')).toBeInTheDocument();
    expect(getByPlaceholderText('Please enter parameters')).toHaveValue('{}');
    expect(getByPlaceholderText('Please enter user information')).toBeInTheDocument();
    expect(getByRole('switch')).toBeInTheDocument();
    expect(getByText('OFF')).toBeInTheDocument();
  });

  test('Verify all form fields can be input/selected by user', () => {
    const { getByText, getByTitle, container, getAllByTestId, getAllByRole, getByPlaceholderText, getByRole } = render(<AdvancedSettingsDialog {...data.advancedSettings} activityType={'ingestion'} />);

    //Verifying database options select field
    fireEvent.click(getByText('data-hub-STAGING'));
    const dbOptions = getAllByTestId('dbOptions').map(li => li);
    expect(dbOptions.map(li => li.textContent).toString()).toEqual('data-hub-STAGING,data-hub-FINAL');
    fireEvent.select(dbOptions[1]);
    expect(getByText('data-hub-FINAL')).toBeInTheDocument();

    //Not able to send input to Additional collections. Test via e2e
    //https://github.com/testing-library/react-testing-library/issues/375
    //Solution in github wont work because our list for additional collection is empty to start with

    fireEvent.change(getByPlaceholderText('Please enter target permissions'), { target: { value: 'data-hub-monitor,update' }});
    expect(getByPlaceholderText('Please enter target permissions')).toHaveValue('data-hub-monitor,update');

    //Verifying provenance options select field
    fireEvent.click(getByText('Coarse-grained'));
    const provOptions = getAllByTestId('provOptions').map(li => li);
    expect(provOptions.map(li => li.textContent).toString()).toEqual('Coarse-grained,Off');
    fireEvent.select(provOptions[1]);
    expect(getByText('Off')).toBeInTheDocument();

    fireEvent.click(getByText('Custom Hook'));
    fireEvent.change(getByPlaceholderText('Please enter module'), { target: { value: 'test-module' }});
    expect(getByPlaceholderText('Please enter module')).toHaveValue('test-module');
    fireEvent.change(getByPlaceholderText('Please enter parameters'), { target: { value: '{}' }});
    expect(getByPlaceholderText('Please enter parameters')).toHaveValue('{}');
    fireEvent.change(getByPlaceholderText('Please enter user information'), { target: { value: 'test-user' }});
    expect(getByPlaceholderText('Please enter user information')).toHaveValue('test-user');
    fireEvent.click(getByRole('switch'));
    expect(getByText('ON')).toBeInTheDocument();
  });

  test('Verify all form fields can be input/selected by user for mapping', () => {
    const { getByText, getAllByTestId, getByPlaceholderText, getByRole } = render(<AdvancedSettingsDialog {...data.advancedSettings} />);

    //Verifying both database options select fields exist
    expect(getByText('data-hub-STAGING')).toBeInTheDocument();
    expect(getByText('data-hub-FINAL')).toBeInTheDocument();

    fireEvent.change(getByPlaceholderText('Please enter target permissions'), { target: { value: 'data-hub-monitor,update' }});
    expect(getByPlaceholderText('Please enter target permissions')).toHaveValue('data-hub-monitor,update');

    // Verify targetFormat options select field
    expect(getByText('JSON')).toBeInTheDocument();
    fireEvent.click(getByText('JSON'));
    const testFormatOptions = getAllByTestId('targetFormatOptions').map(li => li);
    expect(testFormatOptions.map(li => li.textContent).toString()).toEqual('JSON,XML');
    fireEvent.select(testFormatOptions[1]);
    expect(getByText('XML')).toBeInTheDocument();

    //Verifying provenance options select field
    fireEvent.click(getByText('Coarse-grained'));
    const provOptions = getAllByTestId('provOptions').map(li => li);
    expect(provOptions.map(li => li.textContent).toString()).toEqual('Coarse-grained,Off');
    fireEvent.select(provOptions[1]);
    expect(getByText('Off')).toBeInTheDocument();

    fireEvent.click(getByText('Custom Hook'));
    fireEvent.change(getByPlaceholderText('Please enter module'), { target: { value: 'test-module' }});
    expect(getByPlaceholderText('Please enter module')).toHaveValue('test-module');
    fireEvent.change(getByPlaceholderText('Please enter parameters'), { target: { value: '{}' }});
    expect(getByPlaceholderText('Please enter parameters')).toHaveValue('{}');
    fireEvent.change(getByPlaceholderText('Please enter user information'), { target: { value: 'test-user' }});
    expect(getByPlaceholderText('Please enter user information')).toHaveValue('test-user');
    fireEvent.click(getByRole('switch'));
    expect(getByText('ON')).toBeInTheDocument();
  });

  test('Verify read only users cannot edit settings', () => {
    const { getByText, getByPlaceholderText, getByRole } = render(<AdvancedSettingsDialog {...data.advancedSettings} canWrite={false} />);
    expect(document.querySelector('#sourceDatabase')).toHaveClass('ant-select-disabled');
    expect(document.querySelector('#targetDatabase')).toHaveClass('ant-select-disabled');
    expect(document.querySelector('#additionalColl')).toHaveClass('ant-select-disabled');
    expect(getByPlaceholderText('Please enter target permissions')).toBeDisabled();
    expect(document.querySelector('#provGranularity')).toHaveClass('ant-select-disabled');

    fireEvent.click(getByText('Custom Hook'));
    expect(getByPlaceholderText('Please enter module')).toBeDisabled();
    expect(getByPlaceholderText('Please enter parameters')).toBeDisabled();
    expect(getByPlaceholderText('Please enter user information')).toBeDisabled();
    expect(getByRole('switch')).toBeDisabled();
  });

  test('Verify post is called when Mapping configuration is saved', async () => {
    //Enhance this test once DHFPROD-4712 is fixed
    axiosMock.put.mockImplementationOnce(jest.fn(() => Promise.resolve({ status: 200, data: {} })));
    const { getByText } = render(<AdvancedSettingsDialog {...data.advancedSettings} />);
    expect(getByText('Save')).toBeInTheDocument();
    await wait(() => {
      fireEvent.click(getByText('Save'));
    });
    expect(axiosMock.put).toHaveBeenCalledTimes(1);
  });

  test('Verify post is called when Load Data configuration is saved', async () => {
    axiosMock.put.mockImplementationOnce(jest.fn(() => Promise.resolve({ status: 200, data: {} })));
    const { getByText } = render(<AdvancedSettingsDialog {...data.advancedSettings} activityType={'ingestion'} />);
    expect(getByText('Save')).toBeInTheDocument();
    await wait(() => {
      fireEvent.click(getByText('Save'));
    });
    expect(axiosMock.put).toHaveBeenCalledTimes(1);
  });

  test('Verify discard dialog is not opened when Cancel is clicked with no changes to the Mapping settings', () => {
    const { getByText, queryByText } = render(<AdvancedSettingsDialog {...data.advancedSettings} />);
    expect(getByText('Advanced Settings')).toBeInTheDocument();
    fireEvent.click(getByText('Cancel'));
    expect(queryByText('Discard changes?')).not.toBeInTheDocument();
  });

  test('Verify discard dialog is not opened when Cancel is clicked with no changes to the Load Data settings', () => {
    const { getByText, queryByText } = render(<AdvancedSettingsDialog {...data.advancedSettings} activityType={'ingestion'} />);
    expect(getByText('Advanced Settings')).toBeInTheDocument();
    fireEvent.click(getByText('Cancel'));
    expect(queryByText('Discard changes?')).not.toBeInTheDocument();
  });

  test('Verify discard dialog modal when Cancel is clicked', () => {
    const { rerender, queryByText, getByPlaceholderText, getByText } = render(<AdvancedSettingsDialog {...data.advancedSettings} />);
    //fireEvent.change(getByText('Please select target collections'), { target: { value: 'test-collection' }});
    fireEvent.click(getByText('Custom Hook'));
    fireEvent.change(getByPlaceholderText('Please enter module'), { target: { value: 'test-module' }});
    expect(getByPlaceholderText('Please enter module')).toHaveValue('test-module');
    fireEvent.click(getByText('Cancel'));
    expect(getByText('Discard changes?')).toBeInTheDocument();
    expect(getByText('Yes')).toBeInTheDocument();
    expect(getByText('No')).toBeInTheDocument();

    const noButton = getByText('No');
    noButton.onclick = jest.fn();
    fireEvent.click(noButton);
    expect(noButton.onclick).toHaveBeenCalledTimes(1);

    const yesButton = getByText('Yes');
    yesButton.onclick = jest.fn();
    fireEvent.click(yesButton);
    expect(yesButton.onclick).toHaveBeenCalledTimes(1);
  });

  test('Verify discard dialog modal when "x" is clicked', () => {
    const { getByPlaceholderText, getByText, getByLabelText } = render(<AdvancedSettingsDialog {...data.advancedSettings} />);
    fireEvent.click(getByText('Custom Hook'));
    fireEvent.change(getByPlaceholderText('Please enter module'), { target: { value: 'test-module' }});
    expect(getByPlaceholderText('Please enter module')).toHaveValue('test-module');
    fireEvent.click(getByLabelText('Close'));
    expect(getByText('Discard changes?')).toBeInTheDocument();
    expect(getByText('Yes')).toBeInTheDocument();
    expect(getByText('No')).toBeInTheDocument();
  });

});
