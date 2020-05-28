import React from 'react';
import { act, render, fireEvent, waitForElement } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import NewDataLoadDialog from './new-data-load-dialog';
import {BrowserRouter} from "react-router-dom";
import axiosMock from 'axios'

jest.mock('axios');

axiosMock.mockImplementation(jest.fn(() => Promise.resolve({ status: 200, data: {} })));
axiosMock.post.mockImplementation(jest.fn(() => Promise.resolve({ status: 200, data: {} })));
axiosMock.get.mockImplementation(jest.fn(() => Promise.resolve({ status: 200, data: {} })));

describe('New/edit load data configuration', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('fields non-Delimited Text render', async () => {
    const { debug, baseElement, queryAllByText, getAllByLabelText, queryAllByPlaceholderText, getByText } = render(<BrowserRouter><NewDataLoadDialog newLoad={true}
                                                           title={'Title'}
                                                           setNewLoad={() => {}}
                                                           createLoadDataArtifact={() => {}}
                                                           stepData={{}}
                                                           canReadWrite={true}
                                                           canReadOnly={false}/></BrowserRouter>);
    expect(queryAllByPlaceholderText('Enter name')[0]).toBeInTheDocument();
    expect(queryAllByPlaceholderText('Enter description')[0]).toBeInTheDocument();
    expect(baseElement.querySelector('#sourceFormat')).toBeInTheDocument();
    // Field separator and other separator shouldn't show unless it is csv and "Other" field separator
    expect(baseElement.querySelector('#fieldSeparator')).not.toBeInTheDocument();
    expect(baseElement.querySelector('#otherSeparator')).not.toBeInTheDocument();
    expect(baseElement.querySelector('#fileUpload')).toBeInTheDocument();
    expect(baseElement.querySelector('#targetFormat')).toBeInTheDocument();
    expect(baseElement.querySelector('#outputUriPrefix')).toBeInTheDocument();
    expect(queryAllByText("Target URI Preview:").length ).toEqual(0);
    expect(queryAllByPlaceholderText('Enter URI Prefix')[0]).toBeInTheDocument();
    let tooltip  = getAllByLabelText('icon: question-circle');
    //should be the last field in the form
    fireEvent.mouseOver(tooltip[tooltip.length-1]);
    await waitForElement(() => getByText("The prefix you want for the URIs of the loaded documents. Example: If your prefix is /rawData/ and you load a file called customer1.json, the URI of the loaded document becomes /rawData/customer1.json."))
    expect(getByText("Target Format:")).toHaveTextContent('Target Format: *')
    expect(getByText("Output URI Prefix:")).toHaveTextContent('Output URI Prefix:')
  });

  test('fields with Delimited Text render', () => {
    const stepData = { sourceFormat: 'csv', separator: '||', targetFormat: 'json'};
    const { baseElement, queryAllByPlaceholderText } = render(<BrowserRouter><NewDataLoadDialog newLoad={true}
                                                                                                title={'Edit Data Load'}
                                                                                                setNewLoad={() => {}}
                                                                                                createLoadDataArtifact={() => {}}
                                                                                                stepData={stepData}
                                                                                                canReadWrite={true}
                                                                                                canReadOnly={false}/></BrowserRouter>);
    expect(queryAllByPlaceholderText('Enter name')[0]).toBeInTheDocument();
    expect(queryAllByPlaceholderText('Enter description')[0]).toBeInTheDocument();
    expect(baseElement.querySelector('#sourceFormat')).toBeInTheDocument();
    // Field separator and other separator should show, since we've provided step data with Delimited Text and other separator
    expect(baseElement.querySelector('#fieldSeparator')).toBeInTheDocument();
    expect(baseElement.querySelector('#otherSeparator')).toBeInTheDocument();
    expect(baseElement.querySelector('#fileUpload')).toBeInTheDocument();
    expect(baseElement.querySelector('#targetFormat')).toBeInTheDocument();
    expect(baseElement.querySelector('#outputUriReplacement')).not.toBeInTheDocument();
    expect(baseElement.querySelector('#outputUriPrefix')).toBeInTheDocument();
  });

  test('set data should only be called once when adding multiple files', async () => {
    const stepData = { name: 'testSetData', sourceFormat: 'json', targetFormat: 'json'};
    let baseElement, findByPlaceholderText;
    await act(async () => {
      const renderResults = render(<BrowserRouter><NewDataLoadDialog newLoad={true}
                                                              title={'Edit Data Load'}
                                                              setNewLoad={() => {}}
                                                              createLoadDataArtifact={() => {}}
                                                              stepData={stepData}
                                                              canReadWrite={true}
                                                              canReadOnly={false}/></BrowserRouter>);
      baseElement = renderResults.baseElement;
      findByPlaceholderText = renderResults.findByPlaceholderText;
    });
    const fileUpload = await baseElement.querySelector('#fileUpload');
    expect(fileUpload).toBeInTheDocument();
    await act(async () => {
      const files = [new File(["text1"], "test1.txt", {
        type: "text/plain"
      }),new File(["text2"], "test2.txt", {
        type: "text/plain"
      })];

      Object.defineProperty(fileUpload, "files", {
        value: files
      });
      // @ts-ignore We test for fileUpload to exist before hitting this call.
      fireEvent.change(fileUpload);
    });
    await findByPlaceholderText('Enter name');

    expect(axiosMock).toHaveBeenCalledTimes(1);
    expect(axiosMock.get).toHaveBeenCalledTimes(1);
  });
});
