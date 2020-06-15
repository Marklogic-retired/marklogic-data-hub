import React from 'react';
import { render, fireEvent, waitForElement } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import NewLoadDialog from './new-load-dialog';
import {BrowserRouter} from "react-router-dom";
import axiosMock from 'axios'

jest.mock('axios');

axiosMock['mockImplementation'](jest.fn(() => Promise.resolve({ status: 200, data: {} })));
axiosMock.post['mockImplementation'](jest.fn(() => Promise.resolve({ status: 200, data: {} })));
axiosMock.get['mockImplementation'](jest.fn(() => Promise.resolve({ status: 200, data: {} })));

describe('New/edit load data configuration', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('fields non-Delimited Text render', async () => {
    const { debug, baseElement, queryAllByText, getAllByLabelText, queryAllByPlaceholderText, getByText } = render(<BrowserRouter><NewLoadDialog newLoad={true}
                                                           title={'Edit Loading Step'}
                                                           setNewLoad={() => {}}
                                                           createLoadArtifact={() => {}}
                                                           stepData={{}}
                                                           canReadWrite={true}
                                                           canReadOnly={false}/></BrowserRouter>);
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
    //should be the last field in the form
    fireEvent.mouseOver(tooltip[tooltip.length-1]);
    await waitForElement(() => getByText("The prefix you want for the URIs of the loaded records. Example: If your prefix is /rawData/ and you load a file called customer1.json, the URI of the loaded record becomes /rawData/customer1.json."))
    expect(getByText("Target Format:")).toHaveTextContent('Target Format: *');
    expect(getByText("Target URI Prefix:")).toHaveTextContent('Target URI Prefix:');
  });

  test('fields with Delimited Text render', () => {
    const stepData = { sourceFormat: 'csv', separator: '||', targetFormat: 'json'};
    const { baseElement, queryAllByPlaceholderText } = render(<BrowserRouter><NewLoadDialog newLoad={true}
                                                                                                title={'Edit Loading Step'}
                                                                                                setNewLoad={() => {}}
                                                                                                createLoadArtifact={() => {}}
                                                                                                stepData={stepData}
                                                                                                canReadWrite={true}
                                                                                                canReadOnly={false}/></BrowserRouter>);
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

});
