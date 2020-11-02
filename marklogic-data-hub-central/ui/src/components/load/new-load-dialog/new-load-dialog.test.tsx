import React from 'react';
import { render, fireEvent, waitForElement } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import NewLoadDialog from './new-load-dialog';
import {BrowserRouter} from "react-router-dom";
import {NewLoadTooltips} from '../../../config/tooltips.config';
import axiosMock from 'axios';

jest.mock('axios');

axiosMock['mockImplementation'](jest.fn(() => Promise.resolve({ status: 200, data: {} })));
axiosMock.post['mockImplementation'](jest.fn(() => Promise.resolve({ status: 200, data: {} })));
axiosMock.get['mockImplementation'](jest.fn(() => Promise.resolve({ status: 200, data: {} })));

describe('New/edit load data configuration', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('fields non-Delimited Text render', async () => {
    const { debug, baseElement, queryAllByText, getAllByLabelText, queryAllByPlaceholderText, getByText, getByLabelText } = render(<BrowserRouter><NewLoadDialog newLoad={true}
                                                           title={'Edit Loading Step'}
                                                           setNewLoad={() => {}}
                                                           createLoadArtifact={() => {}}
                                                           stepData={{}}
                                                           canReadWrite={true}
                                                           canReadOnly={false}/></BrowserRouter>);
    expect(getByLabelText('newLoadCardTitle')).toBeInTheDocument();
    expect(queryAllByPlaceholderText('Enter name')[0]).toBeInTheDocument();
    expect(queryAllByPlaceholderText('Enter description')[0]).toBeInTheDocument();
    expect(baseElement.querySelector('#sourceFormat')).toBeInTheDocument();
    // Field separator and other separator shouldn't show unless it is csv and "Other" field separator
    expect(baseElement.querySelector('#fieldSeparator')).not.toBeInTheDocument();
    expect(baseElement.querySelector('#otherSeparator')).not.toBeInTheDocument();
    expect(baseElement.querySelector('#targetFormat')).toBeInTheDocument();
    expect(baseElement.querySelector('#outputUriPrefix')).toBeInTheDocument();
    expect(queryAllByText("Target URI Preview:").length ).toEqual(0);
    expect(queryAllByPlaceholderText('Enter URI Prefix')[0]).toBeInTheDocument();
    let tooltip  = getAllByLabelText('icon: question-circle');
    //Tooltip for name
    fireEvent.mouseOver(tooltip[0]);
    await waitForElement(() => getByText(NewLoadTooltips.name));
    //Tooltip for Description
    fireEvent.mouseOver(tooltip[1]);
    await waitForElement(() => getByText(NewLoadTooltips.description));
    //Tooltip for Source Format
    fireEvent.mouseOver(tooltip[2]);
    await waitForElement(() => getByText(NewLoadTooltips.sourceFormat));
    //Tooltip for Target Format
    fireEvent.mouseOver(tooltip[3]);
    await waitForElement(() => getByText(NewLoadTooltips.targetFormat));
    //Tooltip for Target URI Prefix
    fireEvent.mouseOver(tooltip[4]);
    await waitForElement(() => getByText(NewLoadTooltips.outputURIPrefix));
    expect(getByText("Target Format:")).toHaveTextContent('Target Format: *');
    expect(getByText("Target URI Prefix:")).toHaveTextContent('Target URI Prefix:');
  });

  test('fields with Delimited Text render', () => {
    const stepData = { sourceFormat: 'csv', separator: '||', targetFormat: 'json'};
    const { baseElement, queryAllByPlaceholderText,getByLabelText } = render(<BrowserRouter><NewLoadDialog newLoad={true}
                                                                                                title={'Edit Loading Step'}
                                                                                                setNewLoad={() => {}}
                                                                                                createLoadArtifact={() => {}}
                                                                                                stepData={stepData}
                                                                                                canReadWrite={true}
                                                                                                canReadOnly={false}/></BrowserRouter>);
    expect(getByLabelText('newLoadCardTitle')).toBeInTheDocument();
    expect(queryAllByPlaceholderText('Enter name')[0]).toBeInTheDocument();
    expect(queryAllByPlaceholderText('Enter description')[0]).toBeInTheDocument();
    expect(baseElement.querySelector('#sourceFormat')).toBeInTheDocument();
    // Field separator and other separator should show, since we've provided step data with Delimited Text and other separator
    expect(baseElement.querySelector('#fieldSeparator')).toBeInTheDocument();
    expect(baseElement.querySelector('#otherSeparator')).toBeInTheDocument();
    expect(baseElement.querySelector('#targetFormat')).toBeInTheDocument();
    expect(baseElement.querySelector('#outputUriReplacement')).not.toBeInTheDocument();
    expect(baseElement.querySelector('#outputUriPrefix')).toBeInTheDocument();
  });

  test('Verify clicking "Save" with no name shows error', () => {
    const { 
      debug, 
      baseElement, 
      queryAllByText, 
      getAllByLabelText, 
      queryAllByPlaceholderText, 
      getByText, 
      getByLabelText 
    } = render(
      <BrowserRouter><NewLoadDialog newLoad={true}
      title={'Edit Loading Step'}
      setNewLoad={() => {}}
      createLoadArtifact={() => {}}
      stepData={{}}
      canReadWrite={true}
      canReadOnly={false}/></BrowserRouter>
    );

    // message should not show when opening new dialogue box
    expect(getByText('Name is required')).not.toBeInTheDocument(); 

    fireEvent.click(getByLabelText('Save'));

    // message should appear when save button is clicked
    expect(getByText('Name is required')).toBeInTheDocument(); 
  });

});
