import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import {fireEvent, render} from '@testing-library/react';

import MappingCard from './mapping-card';
import axiosMock from 'axios'
import data from "../../../config/bench.config";
import {act} from "react-dom/test-utils";

jest.mock('axios');

describe("Entity Tiles component", () => {
  beforeEach(() => {
    axiosMock.get['mockImplementation']((url) => {
      switch (url) {
        case '/api/flows':
          return Promise.resolve(data.flows);
        case '/api/models/primaryEntityTypes':
          return Promise.resolve(data.primaryEntityTypes);
        case '/api/artifacts/mapping':
          return Promise.resolve(data.mappings);
        default:
          return Promise.reject(new Error('not found'));
      }
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Mapping card does not allow edit without writeMapping authority', async () => {
    let entityModel = data.primaryEntityTypes.data[0];
    let mapping = data.mappings.data[0].artifacts;
    let queryAllByText, getByRole, queryAllByRole;
    const noopFun = () => {};
    const deleteMappingArtifact = jest.fn(() => {});
    await act(async () => {
      const renderResults = render(
        <Router><MappingCard data={mapping}
                             flows={data.flows}
                             entityTypeTitle={entityModel.entityName}
                             getMappingArtifactByMapName={noopFun}
                             deleteMappingArtifact={deleteMappingArtifact}
                             createMappingArtifact={noopFun}
                             updateMappingArtifact={noopFun}
                             canReadOnly={true}
                             canReadWrite={false}
                             canWriteFlow={false}
                             entityModel={entityModel}
                             addStepToFlow={noopFun}
                             addStepToNew={noopFun}/></Router>);
      queryAllByText = renderResults.queryAllByText;
      getByRole = renderResults.getByRole;
      queryAllByRole = renderResults.queryAllByRole;
    });

    expect(getByRole("edit-mapping")).toBeInTheDocument();
    expect(getByRole("settings-mapping")).toBeInTheDocument();
    expect(queryAllByRole('delete-mapping')).toHaveLength(0);
    expect(getByRole('disabled-delete-mapping')).toBeInTheDocument();
    await fireEvent.click(getByRole('disabled-delete-mapping'));
    expect(queryAllByText('Yes')).toHaveLength(0);
    expect(deleteMappingArtifact).not.toBeCalled();
  });

  test('Mapping card does allow edit with writeMapping authority', async () => {
    let entityModel = data.primaryEntityTypes.data[0];
    let mapping = data.mappings.data[0].artifacts;
    let getByText, getByRole, queryAllByRole;
    const noopFun = () => {};
    const deleteMappingArtifact = jest.fn(() => {});
    await act(async () => {
      const renderResults = render(
        <Router><MappingCard data={mapping}
                             flows={data.flows}
                             entityTypeTitle={entityModel.entityName}
                             getMappingArtifactByMapName={noopFun}
                             deleteMappingArtifact={deleteMappingArtifact}
                             createMappingArtifact={noopFun}
                             updateMappingArtifact={noopFun}
                             canReadOnly={true}
                             canReadWrite={true}
                             canWriteFlow={false}
                             entityModel={entityModel}
                             addStepToFlow={noopFun}
                             addStepToNew={noopFun}/></Router>);
      getByText = renderResults.getByText;
      getByRole = renderResults.getByRole;
      queryAllByRole = renderResults.queryAllByRole;
    });

    expect(getByRole("edit-mapping")).toBeInTheDocument();
    expect(getByRole("settings-mapping")).toBeInTheDocument();
    expect(queryAllByRole('disabled-delete-mapping')).toHaveLength(0);
    expect(getByRole('delete-mapping')).toBeInTheDocument();
    await fireEvent.click(getByRole('delete-mapping'));
    await fireEvent.click(getByText('Yes'));
    expect(deleteMappingArtifact).toBeCalled();
  });
});