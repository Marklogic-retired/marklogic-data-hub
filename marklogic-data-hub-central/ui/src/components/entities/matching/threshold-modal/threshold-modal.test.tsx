import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";

import ThresholdModal from './threshold-modal';

import { CurationContext } from '../../../../util/curation-context';
import { updateMatchingArtifact } from '../../../../api/matching';
import { matchThresholdArtifact } from '../../../../assets/mock-data/curation/curation-context-mock';

jest.mock('../../../../api/matching');

const mockMatchingUpdate = updateMatchingArtifact as jest.Mock;

describe('Matching Ruleset Single Modal component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('can add a match threshold as a merge type', () => {
    mockMatchingUpdate.mockResolvedValueOnce({ status: 200, data: {} });

    const toggleModalMock = jest.fn();

    const { queryByText, getByText, rerender, getByLabelText } =  render(
      <CurationContext.Provider value={matchThresholdArtifact}>
        <ThresholdModal
          isVisible={false}
          toggleModal={toggleModalMock}
          editThreshold={{}}
        />
      </CurationContext.Provider>
    );

    expect(queryByText('Add Match Threshold')).toBeNull();

    rerender(
      <CurationContext.Provider value={matchThresholdArtifact}>
        <ThresholdModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editThreshold={{}}
        />
      </CurationContext.Provider>
    );

    expect(queryByText('Add Match Threshold')).toBeInTheDocument();
    userEvent.type(getByLabelText('name-input'), 'nameThreshold');
    userEvent.click(screen.getByText('Select action'));
    userEvent.click(screen.getByText('Merge'));

    userEvent.click(getByText('Save'));
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(1);
  });

  it('can add a match threshold as a notify type and click cancel', () => {
    mockMatchingUpdate.mockResolvedValueOnce({ status: 200, data: {} });

    const toggleModalMock = jest.fn();

    const { queryByText, getByText, rerender, getByLabelText } =  render(
      <CurationContext.Provider value={matchThresholdArtifact}>
        <ThresholdModal
          isVisible={false}
          toggleModal={toggleModalMock}
          editThreshold={{}}
        />
      </CurationContext.Provider>
    );

    expect(queryByText('Add Match Threshold')).toBeNull();

    rerender(
      <CurationContext.Provider value={matchThresholdArtifact}>
        <ThresholdModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editThreshold={{}}
        />
      </CurationContext.Provider>
    );

    expect(queryByText('Add Match Threshold')).toBeInTheDocument();
    userEvent.type(getByLabelText('name-input'), 'nameThreshold');
    userEvent.click(screen.getByText('Select action'));
    userEvent.click(screen.getByText('Merge'));

    userEvent.click(getByText('Cancel'));
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
  });



  it('can add a match threshold as a custom type', () => {
    mockMatchingUpdate.mockResolvedValueOnce({ status: 200, data: {} });

    const toggleModalMock = jest.fn();

    const { queryByText, getByText, rerender, getByLabelText } =  render(
      <CurationContext.Provider value={matchThresholdArtifact}>
        <ThresholdModal
          isVisible={false}
          toggleModal={toggleModalMock}
          editThreshold={{}}
        />
      </CurationContext.Provider>
    );

    expect(queryByText('Add Match Threshold')).toBeNull();

    rerender(
      <CurationContext.Provider value={matchThresholdArtifact}>
        <ThresholdModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editThreshold={{}}
        />
      </CurationContext.Provider>
    );

    expect(queryByText('Add Match Threshold')).toBeInTheDocument();
    userEvent.type(getByLabelText('name-input'), 'customThreshold');
    userEvent.click(screen.getByText('Select action'));
    userEvent.click(screen.getByText('Custom'));
    userEvent.type(getByLabelText('uri-input'), '/custom-modules/matching/nameMatch.xqy');
    userEvent.type(getByLabelText('function-input'), 'nameMatch');
    userEvent.type(getByLabelText('namespace-input'), 'http://example.org/custom-modules/matching/nameMatch');

    userEvent.click(getByText('Save'));
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(1);
  });


  it('can edit a merge type match threshold and click cancel', () => {
    mockMatchingUpdate.mockResolvedValueOnce({ status: 200, data: {} });

    const toggleModalMock = jest.fn();
    let editThreshold = {
      thresholdName: 'test',
      action: 'merge',
      score: 8
    }

    const { queryByText, getByText, rerender, getByLabelText } =  render(
      <CurationContext.Provider value={matchThresholdArtifact}>
        <ThresholdModal
          isVisible={false}
          toggleModal={toggleModalMock}
          editThreshold={editThreshold}
        />
      </CurationContext.Provider>
    );

    expect(queryByText('Edit Match Threshold')).toBeNull();

    rerender(
      <CurationContext.Provider value={matchThresholdArtifact}>
        <ThresholdModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editThreshold={editThreshold}
        />
      </CurationContext.Provider>
    );

    expect(queryByText('Edit Match Threshold')).toBeInTheDocument();
    userEvent.clear(getByLabelText('name-input'));
    userEvent.type(getByLabelText('name-input'), 'testEdit');

    userEvent.click(getByText('Cancel'));
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
  });

  it('can edit a notify type match threshold', () => {
    mockMatchingUpdate.mockResolvedValueOnce({ status: 200, data: {} });

    const toggleModalMock = jest.fn();
    let editThreshold = {
      thresholdName: 'testing',
      action: 'notify',
      score: 8
    }

    const { queryByText, getByText, rerender, getByLabelText } =  render(
      <CurationContext.Provider value={matchThresholdArtifact}>
        <ThresholdModal
          isVisible={false}
          toggleModal={toggleModalMock}
          editThreshold={editThreshold}
        />
      </CurationContext.Provider>
    );

    expect(queryByText('Edit Match Threshold')).toBeNull();

    rerender(
      <CurationContext.Provider value={matchThresholdArtifact}>
        <ThresholdModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editThreshold={editThreshold}
        />
      </CurationContext.Provider>
    );

    expect(queryByText('Edit Match Threshold')).toBeInTheDocument();
    userEvent.clear(getByLabelText('name-input'));
    userEvent.type(getByLabelText('name-input'), 'testEdit');
    userEvent.click(getByLabelText('threshold-select'));
    userEvent.click(screen.getByText('Custom'));
    userEvent.type(getByLabelText('uri-input'), '/custom-modules/matching/nameMatch.xqy');
    userEvent.type(getByLabelText('function-input'), 'nameMatch');
    userEvent.type(getByLabelText('namespace-input'), 'http://example.org/custom-modules/matching/nameMatch');

    userEvent.click(getByText('Save'));
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(1);
  });
});
