import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import {fireEvent, getByLabelText, render} from '@testing-library/react';

import EntityTiles from './entity-tiles';
import axiosMock from 'axios';
import data from "../../assets/mock-data/curation/flows.data";
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
        case '/api/steps/custom':
            return Promise.resolve(data.customSteps);
        case '/api/artifacts/matching':
          return Promise.resolve(data.matchings);
        default:
          return Promise.reject(new Error('not found'));
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Map tab does not appear without readMapping authority', async () => {
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
      expect(queryAllByText('Map')).toHaveLength(0);
  });

  test('Map tab does appear with readMapping authority', async () => {
    let entityModels = {};
    data.primaryEntityTypes.data.forEach((model) => {
      // model has an entityTypeId property, perhaps that should be used instead of entityName?
      entityModels[model.entityName] = model;
    });
    let flows = [];
    let [canReadMatchMerge, canWriteMatchMerge,canWriteMapping, canReadMapping, canReadCustom] = [false, false, false, true, false];
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
            canReadCustom={canReadCustom}
            addStepToFlow={jest.fn}
            addStepToNew={jest.fn}/>
        </Router>,
      );
      getByText = renderResults.getByText;
      queryAllByText = renderResults.queryAllByText;
    });
    expect(queryAllByText('No Entity Type')).toHaveLength(0);
    await fireEvent.click(getByText('Customer'));
    // Check for Mapping tab
    expect(getByText('Map')).toBeInTheDocument();
    // Check for Matching tab
    expect(queryAllByText('Match')).toHaveLength(0);
    expect(queryAllByText('Custom')).toHaveLength(0);
  });

  test('Custom tab appears with readCustom authority', async () => {
      let entityModels = {};
      data.primaryEntityTypes.data.forEach((model) => {
          // model has an entityTypeId property, perhaps that should be used instead of entityName?
          entityModels[model.entityName] = model;
      });
      let flows = [];
      let [canReadMatchMerge, canWriteMatchMerge,canWriteMapping, canReadMapping, canReadCustom] = [false, false, false, true, true];
      let queryAllByText, getByText, getByLabelText;
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
                      canReadCustom={canReadCustom}
                      addStepToFlow={jest.fn}
                      addStepToNew={jest.fn}/>
              </Router>,
          );
          getByText = renderResults.getByText;
          getByLabelText = renderResults.getByLabelText;
          queryAllByText = renderResults.queryAllByText;
      });
      let customerPanel = getByText('Customer');
      let NoEntityTypePanel = getByText('No Entity Type');

      expect(customerPanel).toBeInTheDocument();
      expect(NoEntityTypePanel).toBeInTheDocument();

      await fireEvent.click(customerPanel);
      // Check for Mapping tab
      expect(getByText('Map')).toBeInTheDocument();
      await fireEvent.click(getByText('Custom'));
      expect(getByLabelText('customEntityTitle')).toBeInTheDocument();
      // Check for Matching tab
      expect(queryAllByText('Match')).toHaveLength(0);
      await fireEvent.click(customerPanel);

      await fireEvent.click(NoEntityTypePanel);
      //Custom card 'customXML' should be selected by default
      expect(getByText('customXML')).toBeInTheDocument();
      expect(getByLabelText('customNoEntityTitle')).toBeInTheDocument();
  });
});
