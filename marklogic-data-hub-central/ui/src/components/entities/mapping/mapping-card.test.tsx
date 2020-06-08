import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import {fireEvent, render, wait} from '@testing-library/react';
import { AdvancedSettingsMessages } from '../../../config/messages.config';
import MappingCard from './mapping-card';
import axiosMock from 'axios'
import data from "../../../config/run.config";
import {act} from "react-dom/test-utils";
import mocks from "../../../config/mocks.config";
import {AuthoritiesService, AuthoritiesContext} from "../../../util/authorities";

jest.mock('axios');

describe("Entity Tiles component", () => {
  beforeEach(() => {
    mocks.curateAPI(axiosMock);
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

  test('Open advanced settings', async () => {
      const authorityService = new AuthoritiesService();
      authorityService.setAuthorities(['writeMapping', 'readMapping']);
      let entityModel = data.primaryEntityTypes.data[0];
      let mapping = data.mappings.data[0].artifacts;
      const noopFun = () => {};
      const deleteMappingArtifact = jest.fn(() => {});
      const {getByText,getByRole, getByPlaceholderText} = render(
          <Router><AuthoritiesContext.Provider value={authorityService}><MappingCard data={mapping}
                               flows={data.flows}
                               entityTypeTitle={entityModel.entityName}
                               getMappingArtifactByMapName={noopFun}
                               deleteMappingArtifact={deleteMappingArtifact}
                               createMappingArtifact={noopFun}
                               updateMappingArtifact={noopFun}
                               canReadOnly={false}
                               canReadWrite={true}
                               canWriteFlow={true}
                               entityModel={entityModel}
                               addStepToFlow={noopFun}
                               addStepToNew={noopFun}/></AuthoritiesContext.Provider></Router>);
      await wait(() => {
          fireEvent.click(getByRole("settings-mapping"));
      })
      //set permissions without any errors and hit 'Save'
      let targetPermissions = getByPlaceholderText("Please enter target permissions");
      fireEvent.change(targetPermissions, { target: { value: 'role1,read' }});
      let saveButton = getByText('Save');

      await wait(() => {
          fireEvent.click(saveButton);
      });
      expect(axiosMock.put).toHaveBeenCalledTimes(1);

      //Open settings again
      await wait(() => {
          fireEvent.click(getByRole("settings-mapping"));
      })
      expect(getByText('Batch Size:')).toBeInTheDocument();
      expect(getByPlaceholderText('Please enter batch size')).toHaveValue('50');

      targetPermissions = getByPlaceholderText("Please enter target permissions");
      expect(targetPermissions).toHaveValue('data-hub-common,read,data-hub-common,update');
      saveButton = getByText('Save');

      fireEvent.change(targetPermissions, { target: { value: 'role1' }});
      expect(targetPermissions).toHaveValue('role1');
      await wait(() => {
          fireEvent.click(saveButton);
      });
      expect(getByText(AdvancedSettingsMessages.targetPermissions.incorrectFormat)).toBeInTheDocument();
       fireEvent.change(targetPermissions, { target: { value: 'role1,reader' }});
       await wait(() => {
           fireEvent.click(saveButton);
       });
       expect(getByText(AdvancedSettingsMessages.targetPermissions.invalidCapabilities)).toBeInTheDocument();

       fireEvent.change(targetPermissions, { target: { value: ',,,' }});
       await wait(() => {
           fireEvent.click(saveButton);
       });
       expect(getByText(AdvancedSettingsMessages.targetPermissions.incorrectFormat)).toBeInTheDocument();
  });
});
