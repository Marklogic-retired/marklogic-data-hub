import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import {fireEvent, render} from '@testing-library/react';

import EntityTiles from './entity-tiles';
import axiosMock from 'axios'
import data from "../../config/bench.config";
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
        case '/api/steps/mapping':
          return Promise.resolve(data.mappings);
        case '/api/artifacts/matching':
          return Promise.resolve(data.matchings);
        default:
          return Promise.reject(new Error('not found'));
      }
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  test('Mapping tab does appear with readMapping authority', async () => {
    let entityModels = {};
    data.primaryEntityTypes.data.forEach((model) => {
      // model has an entityTypeId property, perhaps that should be used instead of entityName?
      entityModels[model.entityName] = model;
    });
    let flows = [];
    let [canReadMatchMerge, canWriteMatchMerge,canWriteMapping, canReadMapping] = [false, false, false, true];
    let queryAllByText, getByText;
    await act(async () => {
      const renderResults = render(
        <Router>
          <EntityTiles
            flows={flows}
            canReadMatchMerge={canReadMatchMerge}
            canWriteMatchMerge={canWriteMatchMerge}
            canWriteMapping={canWriteMapping}
            canReadMapping={canReadMapping}
            entityModels={entityModels}
            getEntityModels={jest.fn}
            canWriteFlow={false}
            addStepToFlow={jest.fn}
            addStepToNew={jest.fn}/>
        </Router>,
      );
      getByText = renderResults.getByText;
      queryAllByText = renderResults.queryAllByText;
    });
    await fireEvent.click(getByText('Customer'));
    // Check for Mapping tab
    expect(getByText('Mapping')).toBeInTheDocument();
    // Check for Matching tab
    expect(queryAllByText('Matching')).toHaveLength(0);
  });

  test('Mapping tab does not appear without readMapping authority', async () => {
    let entityModels = {};
    data.primaryEntityTypes.data.forEach((model) => {
      // model has an entityTypeId property, perhaps that should be used instead of entityName?
      entityModels[model.entityName] = model;
    });
    let flows = [];
    let [canReadMatchMerge, canWriteMatchMerge,canWriteMapping, canReadMapping] = [true, false, false, false];
    let queryAllByText, getByText;
    await act(async () => {
      const renderResults = render(
        <Router>
          <EntityTiles
            flows={flows}
            canReadMatchMerge={canReadMatchMerge}
            canWriteMatchMerge={canWriteMatchMerge}
            canWriteMapping={canWriteMapping}
            canReadMapping={canReadMapping}
            entityModels={entityModels}
            getEntityModels={jest.fn}
            canWriteFlow={false}
            addStepToFlow={jest.fn}
            addStepToNew={jest.fn}/>
        </Router>,
      );
      getByText = renderResults.getByText;
      queryAllByText = renderResults.queryAllByText;
    });
    //await fireEvent.click(getByText('Customer'));
    // Check for Mapping tab
    expect(queryAllByText('Mapping')).toHaveLength(0);
  });
})
