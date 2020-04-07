import React from 'react';
import axiosMock from 'axios';
import { fireEvent, render, wait, cleanup } from "@testing-library/react";
import ActivitySettingsDialog from './activity-settings-dialog';
import data from '../../config/data.config';

jest.mock('axios');

describe('Update data load settings component', () => {

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test('Verify settings dialog renders for Mapping', () => {
    const { getByText, getByPlaceholderText, getByRole } = render(<ActivitySettingsDialog {...data.activitySettings} />);
    expect(getByText('Activity Settings')).toBeInTheDocument();
    expect(getByText('Source Database:')).toBeInTheDocument();
    expect(getByText('data-hub-STAGING')).toBeInTheDocument();
    expect(getByText('Target Database:')).toBeInTheDocument();
    expect(getByText('data-hub-FINAL')).toBeInTheDocument();
    //Add a check for target format once implemented
    //Should show default collections applied???
    expect(getByText('Additional Collections:')).toBeInTheDocument();
    expect(getByText('Please select')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter targetPermissions')).toHaveValue('data-hub-operator,read,data-hub-operator,update');
    expect(getByText('Provenance Granularity:')).toBeInTheDocument();
    expect(getByText('coarse')).toBeInTheDocument();
    expect(getByText('Custom Hook')).toBeInTheDocument();    
    fireEvent.click(getByText('Custom Hook'));
    expect(getByPlaceholderText('Enter module')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter parameters')).toHaveValue('{}');
    expect(getByPlaceholderText('Enter user information')).toBeInTheDocument();
    expect(getByRole('switch')).toBeInTheDocument();
    expect(getByText('OFF')).toBeInTheDocument();
  });

  test('Verify settings dialog renders for Load Data', () => {
    const { queryByText, getByText, getByPlaceholderText, getByRole } = render(<ActivitySettingsDialog {...data.activitySettings} activityType={'loadData'} />);
    expect(getByText('Activity Settings')).toBeInTheDocument();
    expect(queryByText('Source Database:')).not.toBeInTheDocument();
    expect(getByText('Target Database:')).toBeInTheDocument();
    expect(getByText('data-hub-STAGING')).toBeInTheDocument();
    expect(getByText('Additional Collections:')).toBeInTheDocument();
    expect(getByText('Please select')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter targetPermissions')).toHaveValue('data-hub-operator,read,data-hub-operator,update');
    expect(getByText('Provenance Granularity:')).toBeInTheDocument();
    expect(getByText('coarse')).toBeInTheDocument();
    expect(getByText('Custom Hook')).toBeInTheDocument();    
    fireEvent.click(getByText('Custom Hook'));
    expect(getByPlaceholderText('Enter module')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter parameters')).toHaveValue('{}');
    expect(getByPlaceholderText('Enter user information')).toBeInTheDocument();
    expect(getByRole('switch')).toBeInTheDocument();
    expect(getByText('OFF')).toBeInTheDocument();
  });

  test('Verify all form fields can be input/selected by user', () => {
    const { getByText, getByTitle, container, getAllByTestId, getAllByRole, getByPlaceholderText, getByRole } = render(<ActivitySettingsDialog {...data.activitySettings} activityType={'loadData'} />);
   
    //Verifying database options select field
    fireEvent.click(getByText('data-hub-STAGING'));
    const dbOptions = getAllByTestId('dbOptions').map(li => li);
    expect(dbOptions.map(li => li.textContent).toString()).toEqual('data-hub-STAGING,data-hub-FINAL');
    fireEvent.select(dbOptions[1]);
    expect(getByText('data-hub-FINAL')).toBeInTheDocument();

    //Not able to send input to Additional collections. Test via e2e
    //https://github.com/testing-library/react-testing-library/issues/375
    //Solution in github wont work because our list for additional collection is empty to start with

    fireEvent.change(getByPlaceholderText('Enter targetPermissions'), { target: { value: 'data-hub-monitor,update' }});
    expect(getByPlaceholderText('Enter targetPermissions')).toHaveValue('data-hub-monitor,update');

    //Verifying provenance options select field
    fireEvent.click(getByText('coarse'));
    const provOptions = getAllByTestId('provOptions').map(li => li);
    expect(provOptions.map(li => li.textContent).toString()).toEqual('coarse,off');
    fireEvent.select(provOptions[1]);
    expect(getByText('off')).toBeInTheDocument();

    fireEvent.click(getByText('Custom Hook'));
    fireEvent.change(getByPlaceholderText('Enter module'), { target: { value: 'test-module' }});
    expect(getByPlaceholderText('Enter module')).toHaveValue('test-module');
    fireEvent.change(getByPlaceholderText('Enter parameters'), { target: { value: '{}' }});
    expect(getByPlaceholderText('Enter parameters')).toHaveValue('{}');
    fireEvent.change(getByPlaceholderText('Enter user information'), { target: { value: 'test-user' }});
    expect(getByPlaceholderText('Enter user information')).toHaveValue('test-user');
    fireEvent.click(getByRole('switch'));
    expect(getByText('ON')).toBeInTheDocument();
  });

  test('Verify all form fields can be input/selected by user for mapping', () => {
    const { getByText, getAllByTestId, getByPlaceholderText, getByRole } = render(<ActivitySettingsDialog {...data.activitySettings} />);

    //Verifying both database options select fields exist
    expect(getByText('data-hub-STAGING')).toBeInTheDocument();
    expect(getByText('data-hub-FINAL')).toBeInTheDocument();

    fireEvent.change(getByPlaceholderText('Enter targetPermissions'), { target: { value: 'data-hub-monitor,update' }});
    expect(getByPlaceholderText('Enter targetPermissions')).toHaveValue('data-hub-monitor,update');

    // Verify targetFormat options select field
    expect(getByText('JSON')).toBeInTheDocument();
    fireEvent.click(getByText('JSON'));
    const testFormatOptions = getAllByTestId('targetFormatOptions').map(li => li);
    expect(testFormatOptions.map(li => li.textContent).toString()).toEqual('JSON,XML');
    fireEvent.select(testFormatOptions[1]);
    expect(getByText('XML')).toBeInTheDocument();

    //Verifying provenance options select field
    fireEvent.click(getByText('coarse'));
    const provOptions = getAllByTestId('provOptions').map(li => li);
    expect(provOptions.map(li => li.textContent).toString()).toEqual('coarse,off');
    fireEvent.select(provOptions[1]);
    expect(getByText('off')).toBeInTheDocument();

    fireEvent.click(getByText('Custom Hook'));
    fireEvent.change(getByPlaceholderText('Enter module'), { target: { value: 'test-module' }});
    expect(getByPlaceholderText('Enter module')).toHaveValue('test-module');
    fireEvent.change(getByPlaceholderText('Enter parameters'), { target: { value: '{}' }});
    expect(getByPlaceholderText('Enter parameters')).toHaveValue('{}');
    fireEvent.change(getByPlaceholderText('Enter user information'), { target: { value: 'test-user' }});
    expect(getByPlaceholderText('Enter user information')).toHaveValue('test-user');
    fireEvent.click(getByRole('switch'));
    expect(getByText('ON')).toBeInTheDocument();
  });

  test('Verify read only users cannot edit settings', () => {
    const { getByText, getByPlaceholderText, getByRole } = render(<ActivitySettingsDialog {...data.activitySettings} canWrite={false} />);
    expect(document.querySelector('#sourceDatabase')).toHaveClass('ant-select-disabled');
    expect(document.querySelector('#targetDatabase')).toHaveClass('ant-select-disabled');
    expect(document.querySelector('#additionalColl')).toHaveClass('ant-select-disabled');
    expect(getByPlaceholderText('Enter targetPermissions')).toBeDisabled();
    expect(document.querySelector('#provGranularity')).toHaveClass('ant-select-disabled');

    fireEvent.click(getByText('Custom Hook'));
    expect(getByPlaceholderText('Enter module')).toBeDisabled();
    expect(getByPlaceholderText('Enter parameters')).toBeDisabled();
    expect(getByPlaceholderText('Enter user information')).toBeDisabled();
    expect(getByRole('switch')).toBeDisabled();
  });

  test('Verify post is called when Mapping configuration is saved', async () => {
    //Enhance this test once DHFPROD-4712 is fixed
    axiosMock.post.mockImplementationOnce(jest.fn(() => Promise.resolve({ status: 200, data: {} })));
    const { getByText } = render(<ActivitySettingsDialog {...data.activitySettings} />);
    expect(getByText('Save')).toBeInTheDocument();
    await wait(() => {
      fireEvent.click(getByText('Save'));
    });
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
  });

  test('Verify post is called when Load Data configuration is saved', async () => {
    axiosMock.post.mockImplementationOnce(jest.fn(() => Promise.resolve({ status: 200, data: {} })));
    const { getByText } = render(<ActivitySettingsDialog {...data.activitySettings} activityType={'loadData'} />);
    expect(getByText('Save')).toBeInTheDocument();
    await wait(() => {
      fireEvent.click(getByText('Save'));
    });
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
  });

  test('Verify discard dialog is not opened when Cancel is clicked with no changes to the Mapping settings', () => {
    const { getByText, queryByText } = render(<ActivitySettingsDialog {...data.activitySettings} />);
    expect(getByText('Activity Settings')).toBeInTheDocument();
    fireEvent.click(getByText('Cancel'));
    expect(queryByText('Discard changes?')).not.toBeInTheDocument();
  });

  test('Verify discard dialog is not opened when Cancel is clicked with no changes to the Load Data settings', () => {
    const { getByText, queryByText } = render(<ActivitySettingsDialog {...data.activitySettings} activityType={'loadData'} />);
    expect(getByText('Activity Settings')).toBeInTheDocument();
    fireEvent.click(getByText('Cancel'));
    expect(queryByText('Discard changes?')).not.toBeInTheDocument();
  });

  test('Verify discard dialog modal when Cancel is clicked', () => {
    const { rerender, queryByText, getByPlaceholderText, getByText } = render(<ActivitySettingsDialog {...data.activitySettings} />);
    //fireEvent.change(getByText('Please select'), { target: { value: 'test-collection' }});
    fireEvent.click(getByText('Custom Hook'));
    fireEvent.change(getByPlaceholderText('Enter module'), { target: { value: 'test-module' }});
    expect(getByPlaceholderText('Enter module')).toHaveValue('test-module');
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
    const { getByPlaceholderText, getByText, getByLabelText } = render(<ActivitySettingsDialog {...data.activitySettings} />);
    fireEvent.click(getByText('Custom Hook'));
    fireEvent.change(getByPlaceholderText('Enter module'), { target: { value: 'test-module' }});
    expect(getByPlaceholderText('Enter module')).toHaveValue('test-module');
    fireEvent.click(getByLabelText('Close'));
    expect(getByText('Discard changes?')).toBeInTheDocument();
    expect(getByText('Yes')).toBeInTheDocument();
    expect(getByText('No')).toBeInTheDocument();
  });

});
