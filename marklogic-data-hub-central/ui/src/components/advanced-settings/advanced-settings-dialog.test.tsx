import React from 'react';
import axiosMock from 'axios';
import { fireEvent, render, wait, waitForElement, act, cleanup } from "@testing-library/react";
import AdvancedSettingsDialog from './advanced-settings-dialog';
import mocks from '../../api/__mocks__/mocks.data';
import data from '../../assets/mock-data/advanced-settings.data';
import {AdvancedSettings} from "../../config/tooltips.config";

jest.mock('axios');

describe('Advanced Settings dialog', () => {

  beforeEach(() => {
    mocks.advancedAPI(axiosMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test('Verify settings for Load', async () => {
    const { getByText, getAllByText, getAllByLabelText, queryByText } = render(
      <AdvancedSettingsDialog {...data.advancedLoad} />
    );

    expect(getByText('Advanced Settings')).toBeInTheDocument();

    //Verify if the step name is available in the settings dialog
    expect(document.querySelector('div p:nth-child(2)').textContent).toEqual(data.advancedLoad.stepData.name);

    expect(queryByText('Source Database')).not.toBeInTheDocument();
    expect(getByText('Target Database')).toBeInTheDocument();
    expect(getByText('data-hub-STAGING')).toBeInTheDocument();

    expect(getByText('Target Collections')).toBeInTheDocument();
    expect(getByText('Please add target collections')).toBeInTheDocument();
    expect(getByText('Default Collections')).toBeInTheDocument();
    expect((await(waitForElement(() => getAllByText('AdvancedLoad')))).length > 0);

    expect(getByText('Target Permissions')).toBeInTheDocument();

    expect(getByText('Provenance Granularity')).toBeInTheDocument();
    expect(getByText('Coarse-grained')).toBeInTheDocument();

    expect(getByText('Batch Size')).toBeInTheDocument();

    expect(getByText('Header Content')).toBeInTheDocument();
    expect(getByText('{ "header": true }')).toBeInTheDocument();

    expect(getByText('Processors')).toBeInTheDocument();
    expect(getByText('Custom Hook')).toBeInTheDocument();

    fireEvent.click(getByText('Processors'));
    expect(getByText('{ "processor": true }')).toBeInTheDocument();

    fireEvent.click(getByText('Custom Hook'));
    expect(getByText('{ "hook": true }')).toBeInTheDocument();

  });

  test('Verify settings for Mapping', async () => {
    const { getByText, getAllByText } = render(
      <AdvancedSettingsDialog {...data.advancedMapping} />
    );

    expect(getByText('Advanced Settings')).toBeInTheDocument();

    //Verify if the step name is available in the settings dialog
    expect(document.querySelector('div p:nth-child(2)').textContent).toEqual(data.advancedMapping.stepData.name);

    expect(getByText('Source Database')).toBeInTheDocument();
    expect(getByText('data-hub-STAGING')).toBeInTheDocument();
    expect(getByText('Target Database')).toBeInTheDocument();
    expect(getByText('data-hub-FINAL')).toBeInTheDocument();

    expect(getByText('Target Collections')).toBeInTheDocument();
    expect(getByText('Please add target collections')).toBeInTheDocument();
    expect(getByText('Default Collections')).toBeInTheDocument();
    expect((await(waitForElement(() => getAllByText('AdvancedMapping')))).length > 0);

    expect(getByText('Target Permissions')).toBeInTheDocument();

    expect(getByText('Header Content')).toBeInTheDocument();
    expect(getByText('{ "header": true }')).toBeInTheDocument();

    expect(getByText('Batch Size')).toBeInTheDocument();

    expect(getByText('Provenance Granularity')).toBeInTheDocument();
    expect(getByText('Coarse-grained')).toBeInTheDocument();

    expect(getByText('Processors')).toBeInTheDocument();
    expect(getByText('Custom Hook')).toBeInTheDocument();

    fireEvent.click(getByText('Processors'));
    expect(getByText('{ "processor": true }')).toBeInTheDocument();

    fireEvent.click(getByText('Custom Hook'));
    expect(getByText('{ "hook": true }')).toBeInTheDocument();

  });

  test('Verify form fields can be input/selected', async () => {
    let getByText, getAllByText, getByLabelText, getAllByTestId, getByPlaceholderText, debug;
    await act(async () => {
      const renderResults = render(
        <AdvancedSettingsDialog {...data.advancedMapping} />
      );
      getByText = renderResults.getByText;
      getAllByText = renderResults.getAllByText;
      getByLabelText = renderResults.getByLabelText;
      getAllByTestId = renderResults.getAllByTestId;
      getByPlaceholderText = renderResults.getByPlaceholderText;
      debug = renderResults.debug;
    });

    fireEvent.click(getByLabelText('sourceDatabase-select'));
    const sourceDbOptions = getAllByTestId('sourceDbOptions').map(li => li);
    expect(sourceDbOptions.map(li => li.textContent).toString()).toEqual('data-hub-STAGING,data-hub-FINAL');

    fireEvent.select(sourceDbOptions[1]);
    expect(getAllByText('data-hub-FINAL').length === 2);

    fireEvent.click(getByLabelText('targetDatabase-select'));
    const targetDbOptions = getAllByTestId('targetDbOptions').map(li => li);
    expect(targetDbOptions.map(li => li.textContent).toString()).toEqual('data-hub-STAGING,data-hub-FINAL');
    fireEvent.select(targetDbOptions[0]);
    expect(getAllByText('data-hub-STAGING').length === 1);

    fireEvent.change(getByPlaceholderText('Please enter batch size'), { target: { value: '50' }});
    expect(getByPlaceholderText('Please enter batch size')).toHaveValue('50');

    //Verifying provenance options select field
    fireEvent.click(getByText('Coarse-grained'));
    const provOptions = getAllByTestId('provOptions').map(li => li);
    expect(provOptions.map(li => li.textContent).toString()).toEqual('Coarse-grained,Off');
    fireEvent.select(provOptions[1]);
    expect(getByText('Off')).toBeInTheDocument();

    //Not able to send input to Additional collections. Test via e2e
    //https://github.com/testing-library/react-testing-library/issues/375
    //Solution in github wont work because our list for additional collection is empty to start with

    fireEvent.change(getByPlaceholderText('Please enter target permissions'), { target: { value: 'permissions-changed' }});
    expect(getByPlaceholderText('Please enter target permissions')).toHaveValue('permissions-changed');

    fireEvent.change(getByLabelText('headers-textarea'), { target: { value: 'headers-changed' }});
    expect(getByLabelText('headers-textarea')).toHaveValue('headers-changed');

    fireEvent.click(getByText('Please select target format'));
    const formatOptions = getAllByTestId('targetFormatOptions').map(li => li);
    expect(formatOptions.map(li => li.textContent).toString()).toEqual('JSON,XML');
    fireEvent.select(formatOptions[1]);
    expect(getByText('XML')).toBeInTheDocument();

    fireEvent.change(getByPlaceholderText('Please enter batch size'), { target: { value: '25' }});
    expect(getByPlaceholderText('Please enter batch size')).toHaveValue('25');

    // Verify targetFormat options select field
    expect(getByText('JSON')).toBeInTheDocument();
    fireEvent.click(getByText('JSON'));
    const testFormatOptions = getAllByTestId('targetFormatOptions').map(li => li);
    expect(testFormatOptions.map(li => li.textContent).toString()).toEqual('JSON,XML');
    fireEvent.select(testFormatOptions[1]);

    fireEvent.click(getByText('Processors'));
    fireEvent.change(getByLabelText('processors-textarea'), { target: { value: 'processors-changed' }});
    expect(getByLabelText('processors-textarea')).toHaveValue('processors-changed');

    fireEvent.click(getByText('Custom Hook'));
    fireEvent.change(getByLabelText('customHook-textarea'), { target: { value: 'hook-changed' }});
    expect(getByLabelText('customHook-textarea')).toHaveValue('hook-changed');

  });

  test('Verify no/invalid/valid JSON is recognized correctly in JSON fields', async () => {
    let getByText, getByLabelText, queryAllByText;
    await act(async () => {
      const renderResults = render(
        <AdvancedSettingsDialog {...data.advancedMapping} />
      );
      getByText = renderResults.getByText;
      getByLabelText = renderResults.getByLabelText;
      queryAllByText = renderResults.queryAllByText;
    });

    // Expand all textarea inputs
    fireEvent.click(getByText('Processors'));
    fireEvent.click(getByText('Custom Hook'));

    // No errors at start
    expect(queryAllByText('Invalid JSON').length === 0);

    // No JSON (empty field)
    fireEvent.change(getByLabelText('headers-textarea'), { target: { value: '' }});
    expect(queryAllByText('Invalid JSON').length === 0);
    fireEvent.change(getByLabelText('processors-textarea'), { target: { value: '' }});
    expect(queryAllByText('Invalid JSON').length === 0);
    fireEvent.change(getByLabelText('customHook-textarea'), { target: { value: '' }});
    expect(queryAllByText('Invalid JSON').length === 0);

    // Invalid JSON
    fireEvent.change(getByLabelText('headers-textarea'), { target: { value: '{"badJSON": "noClosingBracket"' }});
    expect(queryAllByText('Invalid JSON').length === 1);
    fireEvent.change(getByLabelText('processors-textarea'), { target: { value: '{"badJSON": "noClosingBracket"' }});
    expect(queryAllByText('Invalid JSON').length === 2);
    fireEvent.change(getByLabelText('customHook-textarea'), { target: { value: '{"badJSON": "noClosingBracket"' }});
    expect(queryAllByText('Invalid JSON').length === 3);

    // Valid JSON
    fireEvent.change(getByLabelText('headers-textarea'), { target: { value: '{"goodJSON": true}' }});
    expect(queryAllByText('Invalid JSON').length === 2);
    fireEvent.change(getByLabelText('processors-textarea'), { target: { value: '{"goodJSON": true}' }});
    expect(queryAllByText('Invalid JSON').length === 1);
    fireEvent.change(getByLabelText('customHook-textarea'), { target: { value: '{"goodJSON": true}' }});
    expect(queryAllByText('Invalid JSON').length === 0);

  });

  test('Verify read only users cannot edit settings', async () => {
    let getByText, getByPlaceholderText;
    await act(async () => {
      const renderResults = render(
        <AdvancedSettingsDialog {...data.advancedMapping} canWrite={false} />
      );
      getByText = renderResults.getByText;
      getByPlaceholderText = renderResults.getByPlaceholderText;
    });

    expect(document.querySelector('#sourceDatabase')).toHaveClass('ant-select-disabled');
    expect(document.querySelector('#targetDatabase')).toHaveClass('ant-select-disabled');
    expect(document.querySelector('#additionalColl')).toHaveClass('ant-select-disabled');
    expect(getByPlaceholderText('Please enter target permissions')).toBeDisabled();
    expect(getByPlaceholderText('Please enter batch size')).toBeDisabled();
    expect(document.querySelector('#headers')).toHaveClass('ant-input-disabled');
    expect(document.querySelector('#targetFormat')).toHaveClass('ant-select-disabled');
    expect(document.querySelector('#provGranularity')).toHaveClass('ant-select-disabled');

    fireEvent.click(getByText('Processors'));
    expect(document.querySelector('#processors')).toHaveClass('ant-input-disabled');

    fireEvent.click(getByText('Custom Hook'));
    expect(document.querySelector('#customHook')).toHaveClass('ant-input-disabled');
  });

  test('Verify post is called when Mapping settings are saved', async () => {
    // Enhance this test once DHFPROD-4712 is fixed
    const { getByText } = render(<AdvancedSettingsDialog {...data.advancedMapping} />);
    expect(getByText('Save')).toBeInTheDocument();
    await wait(() => {
      fireEvent.click(getByText('Save'));
    });
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
  });

  test('Verify post is called when Load settings are saved', async () => {
    const { getByText } = render(<AdvancedSettingsDialog {...data.advancedLoad} />);
    expect(getByText('Save')).toBeInTheDocument();
    await wait(() => {
      fireEvent.click(getByText('Save'));
    });
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
  });

  test('Verify discard dialog is not opened when Mapping settings are canceled with no changes', async () => {
    let getByText, queryByText;
    await act(async () => {
      const renderResults = render(
        <AdvancedSettingsDialog {...data.advancedMapping} />
      );
      getByText = renderResults.getByText;
      queryByText = renderResults.queryByText;
    });

    expect(getByText('Advanced Settings')).toBeInTheDocument();
    fireEvent.click(getByText('Cancel'));
    expect(queryByText('Discard changes?')).not.toBeInTheDocument();
  });

  test('Verify discard dialog is not opened when Load settings are canceled with no changes', async () => {
    let getByText, queryByText;
    await act(async () => {
      const renderResults = render(
        <AdvancedSettingsDialog {...data.advancedMapping} />
      );
      getByText = renderResults.getByText;
      queryByText = renderResults.queryByText;
    });

    expect(getByText('Advanced Settings')).toBeInTheDocument();
    fireEvent.click(getByText('Cancel'));
    expect(queryByText('Discard changes?')).not.toBeInTheDocument();
  });

  test('Verify discard dialog modal when Cancel is clicked', async () => {
    let getByText, getByPlaceholderText;
    await act(async () => {
      const renderResults = render(
        <AdvancedSettingsDialog {...data.advancedMapping} />
      );
      getByText = renderResults.getByText;
      getByPlaceholderText = renderResults.getByPlaceholderText;
    });

    fireEvent.change(getByPlaceholderText('Please enter target permissions'), { target: { value: 'permissions-changed' }});
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

  test('Verify discard dialog modal when "x" is clicked', async () => {
    let getByText, getByPlaceholderText, getByLabelText;
    await act(async () => {
      const renderResults = render(
        <AdvancedSettingsDialog {...data.advancedMapping} />
      );
      getByText = renderResults.getByText;
      getByPlaceholderText = renderResults.getByPlaceholderText;
      getByLabelText = renderResults.getByLabelText;
    });

    fireEvent.change(getByPlaceholderText('Please enter target permissions'), { target: { value: 'permissions-changed' }});
    expect(getByPlaceholderText('Please enter target permissions')).toHaveValue('permissions-changed');
    fireEvent.click(getByLabelText('Close'));
    expect(getByText('Discard changes?')).toBeInTheDocument();
    expect(getByText('Yes')).toBeInTheDocument();
    expect(getByText('No')).toBeInTheDocument();
  });

  test('Verify tooltips', async () => {
    const { getByText, getAllByLabelText } = render(
      <AdvancedSettingsDialog {...data.advancedMapping} />
    );
    fireEvent.click(getByText('Processors'));
    fireEvent.click(getByText('Custom Hook'));
    let tipIcons  = getAllByLabelText('icon: question-circle');
    const tips = ['sourceDatabase', 'targetDatabase', 'additionalCollections', 'targetPermissions', 
      'targetFormat', 'provGranularity', 'batchSize', 'headers', 'processors', 'customHook'];
    tips.forEach(async (tip, i) => {
      fireEvent.mouseOver(tipIcons[i]);
      await waitForElement(() => getByText(AdvancedSettings[tip]))
    })
  });

});
