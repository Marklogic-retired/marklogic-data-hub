import React from 'react';
import { BrowserRouter as Router, MemoryRouter } from 'react-router-dom';
import {fireEvent, render, wait, cleanup, waitForElement} from '@testing-library/react';
import { AdvancedSettingsMessages } from '../../../config/messages.config';
import MappingCard from './mapping-card';
import axiosMock from 'axios'
import data from "../../../assets/mock-data/curation/flows.data";
import {act} from "react-dom/test-utils";
import { AuthoritiesService, AuthoritiesContext } from '../../../util/authorities';
import mocks from '../../../api/__mocks__/mocks.data';
import {SecurityTooltips} from "../../../config/tooltips.config";

jest.mock('axios');

const mockHistoryPush = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

const getSubElements=(content,node, title)=>{
    const hasText = node => node.textContent === title;
    const nodeHasText = hasText(node);
    const childrenDontHaveText = Array.from(node.children).every(
        child => !hasText(child)
    );
    return nodeHasText && childrenDontHaveText;
}

describe("Mapping Card component", () => {

  const mapping = data.mappings.data[0].artifacts;
  const entityModel = data.primaryEntityTypes.data[0];
  const mappingProps = {
    data: mapping,
    flows: data.flows.data,
    entityTypeTitle: entityModel.entityName,
    entityModel: entityModel,
    deleteMappingArtifact: jest.fn(() => {}),
    getMappingArtifactByMapName: () => {},
    createMappingArtifact: () => {},
    updateMappingArtifact: () => {},
    addStepToFlow: () => {},
    addStepToNew: () => {},
    canReadOnly: false,
    canReadWrite: false,
    canWriteFlow: false,
  }

  beforeEach(() => {
    mocks.curateAPI(axiosMock);
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test('Mapping card does not allow edit without writeMapping authority', async () => {
    const deleteMappingArtifact = jest.fn(() => {});
    let queryAllByText, getByText, getByRole, queryAllByRole, getByTestId;
    await act(async () => {
      const renderResults = render(
        <Router><MappingCard
          {...mappingProps}
          canReadOnly={true}
          deleteMappingArtifact={deleteMappingArtifact}
        /></Router>
      );
      getByText = renderResults.getByText;
      getByRole = renderResults.getByRole;
      queryAllByText = renderResults.queryAllByText;
      queryAllByRole = renderResults.queryAllByRole;
      getByTestId = renderResults.getByTestId;
    });

    fireEvent.mouseOver(getByRole('edit-mapping'));
    await wait (() => expect(getByText('Edit')).toBeInTheDocument());
    fireEvent.mouseOver(getByTestId('Mapping1-stepDetails'));
    await wait (() => expect(getByText('Step Details')).toBeInTheDocument());
    fireEvent.mouseOver(getByRole('settings-mapping'));
    await wait (() => expect(getByText('Settings')).toBeInTheDocument());
    expect(queryAllByRole('delete-mapping')).toHaveLength(0);

    // test delete icon displays correct tooltip when disabled
    fireEvent.mouseOver(getByRole('disabled-delete-mapping'));
    await wait (() => expect(getByText('Delete: ' + SecurityTooltips.missingPermission)).toBeInTheDocument());

    await fireEvent.click(getByRole('disabled-delete-mapping'));
    expect(queryAllByText('Yes')).toHaveLength(0);
    expect(deleteMappingArtifact).not.toBeCalled();

  });

  test('Mapping card does allow edit with writeMapping authority', async () => {
    let mapping = data.mappings.data[0].artifacts;
    const deleteMappingArtifact = jest.fn(() => {});
    let getByText, getByRole, queryAllByRole, getByTestId;
    await act(async () => {
      const renderResults = render(
        <Router><MappingCard
          {...mappingProps}
          canReadOnly={true}
          canReadWrite={true}
          deleteMappingArtifact={deleteMappingArtifact}
        /></Router>
      );
      getByText = renderResults.getByText;
      getByRole = renderResults.getByRole;
      queryAllByRole = renderResults.queryAllByRole;
      getByTestId = renderResults.getByTestId;
    });

    expect(getByRole("edit-mapping")).toBeInTheDocument();
    expect(getByTestId("Mapping1-stepDetails")).toBeInTheDocument();
    expect(getByRole("settings-mapping")).toBeInTheDocument();
    expect(queryAllByRole('disabled-delete-mapping')).toHaveLength(0);
    expect(getByRole('delete-mapping')).toBeInTheDocument();

    // check if delete tooltip appears
    fireEvent.mouseOver(getByRole('delete-mapping'));
    await wait (() => expect(getByText('Delete')).toBeInTheDocument());
    await fireEvent.click(getByRole('delete-mapping'));
    await fireEvent.click(getByText('Yes'));
    expect(deleteMappingArtifact).toBeCalled();
    expect(await(waitForElement(() => getByText((content, node) => {
          return getSubElements(content, node,"Are you sure you want to delete the Mapping1 step?")
    })))).toBeInTheDocument();
  });

  test('Mapping card parses XML appropriately', async () => {
    const mappingArtifactByNameFunction = () => {
      return { sourceDatabase: 'data-hub-STAGING' };
    };
    let mapping = data.mappings.data[0].artifacts;
    let getByText, getByTestId;
    await act(async () => {
      const renderResults = render(
        <Router><MappingCard
          {...mappingProps}
          getMappingArtifactByMapName={mappingArtifactByNameFunction}
          canReadOnly={true}
          canReadWrite={true}
        /></Router>);
      getByText = renderResults.getByText;
      getByTestId = renderResults.getByTestId;
    });

    await act(async () => {
      await fireEvent.click(getByTestId("Mapping1-stepDetails"));
    });
    const orderDetailsNode = getByText("OrderDetails");
    expect(orderDetailsNode).toBeInTheDocument();
    expect(orderDetailsNode.parentNode).toHaveTextContent('OrderNS:');

  });

  test('Open Advanced Step settings', async () => {
      const authorityService = new AuthoritiesService();
      authorityService.setAuthorities(['writeMapping', 'readMapping']);
        let mapping = data.mappings.data[0].artifacts;
      const {getByText,getByRole, getByPlaceholderText} = render(
        <Router><AuthoritiesContext.Provider value={authorityService}><MappingCard
          {...mappingProps}
          canReadWrite={true}
          canWriteFlow={true}
        /></AuthoritiesContext.Provider></Router>
      );

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
      expect(axiosMock.post).toHaveBeenCalledTimes(1);

      //Open settings again
      await wait(() => {
          fireEvent.click(getByRole("settings-mapping"));
      })

      expect(getByText('Batch Size')).toBeInTheDocument();
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

  test('Verify Card sort order and adding the step to an existing flow where step DOES NOT exist', async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(['readMapping', 'writeMapping', 'writeFlow']);
    let mapping = data.mappings.data[0].artifacts.concat(data.mappings.data[1].artifacts);
    const noopFun = () => {};
    let getByText, getByLabelText, getByTestId;
    await act(async () => {
      const renderResults = render(
        <MemoryRouter><AuthoritiesContext.Provider value={authorityService}><MappingCard
          {...mappingProps}
          data={mapping}
          canReadWrite={true}
          canWriteFlow={true}
        /></AuthoritiesContext.Provider></MemoryRouter>
      );
      getByText = renderResults.getByText;
      getByLabelText = renderResults.getByLabelText;
      getByTestId = renderResults.getByTestId
    });

    // Check if the card is rendered properly
    expect(getByText('Add New')).toBeInTheDocument();
    expect(getByText('Mapping1')).toBeInTheDocument();
    expect(getByText('Last Updated: 04/24/2020 1:21PM')).toBeInTheDocument();
    expect(getByText('Mapping2')).toBeInTheDocument();
    expect(getByText('Last Updated: 10/01/2020 2:38AM')).toBeInTheDocument();

    // Verify cards get sorted by last updated
    let mapCards: any = document.querySelectorAll('.ant-col');
    expect(mapCards[0]).toHaveTextContent('Add New');
    expect(mapCards[1]).toHaveTextContent('Mapping2');
    expect(mapCards[2]).toHaveTextContent('Mapping1');

    // Hover for options
    fireEvent.mouseOver(getByText('Mapping2'));
    expect(getByTestId('Mapping2-toNewFlow')).toBeInTheDocument(); // 'Add to a new Flow'
    expect(getByTestId('Mapping2-toExistingFlow')).toBeInTheDocument(); // 'Add to an existing Flow'

    // Open menu, choose flow
    fireEvent.click(getByTestId('Mapping2-flowsList'));
    fireEvent.click(getByText('testFlow'));

    // Dialog appears, click 'Yes' button
    expect(getByLabelText('step-not-in-flow')).toBeInTheDocument();
    fireEvent.click(getByTestId('Mapping2-to-testFlow-Confirm'));

    // Check if the /tiles/run/add route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith('/tiles/run/add'); })
    // TODO- E2E test to check if the Run tile is loaded or not.

  });

  test('Adding the step to an existing flow where step DOES exist', async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(['readMapping', 'writeMapping', 'writeFlow']);
    let getByText, getByLabelText, getByTestId;
    await act(async () => {
      const renderResults = render(
        <MemoryRouter><AuthoritiesContext.Provider value={authorityService}><MappingCard
          {...mappingProps}
          canReadWrite={true}
          canWriteFlow={true}
        /></AuthoritiesContext.Provider></MemoryRouter>
      );
      getByText = renderResults.getByText;
      getByLabelText = renderResults.getByLabelText;
      getByTestId = renderResults.getByTestId
    });

    // Hover for options, open menu, choose flow
    fireEvent.mouseOver(getByText('Mapping1'));
    fireEvent.click(getByTestId('Mapping1-flowsList'));
    fireEvent.click(getByText('testFlow'));

    // Dialog appears, click 'Yes'
    expect(getByLabelText('step-in-flow')).toBeInTheDocument();
    fireEvent.click(getByTestId('Mapping1-to-testFlow-Confirm'));

    //Check if the /tiles/run/add route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith('/tiles/run/add'); })
    //TODO- E2E test to check if the Run tile is loaded or not.

  });

  test('Adding the step to a new flow', async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(['readMapping', 'writeMapping', 'writeFlow']);
    let getByText, getByLabelText, getByTestId;
    await act(async () => {
      const renderResults = render(
        <MemoryRouter><AuthoritiesContext.Provider value={authorityService}><MappingCard
          {...mappingProps}
          canReadWrite={true}
          canWriteFlow={true}
        /></AuthoritiesContext.Provider></MemoryRouter>
      );
      getByText = renderResults.getByText;
      getByLabelText = renderResults.getByLabelText;
      getByTestId = renderResults.getByTestId
    });

    //Check if the card is rendered properly
    expect(getByText('Add New')).toBeInTheDocument();
    expect(getByText('Last Updated: 04/24/2020 1:21PM')).toBeInTheDocument();

    fireEvent.mouseOver(getByText('Mapping1')); // Hover over the Map Card to get more options

    //Verify if the flow related options are availble on mouseOver
    expect(getByTestId('Mapping1-toNewFlow')).toBeInTheDocument(); // check if option 'Add to a new Flow' is visible
    expect(getByTestId('Mapping1-toExistingFlow')).toBeInTheDocument(); // check if option 'Add to an existing Flow' is visible

    //Click on the link 'Add step to a new Flow'.
    fireEvent.click(getByTestId('Mapping1-toNewFlow'));

    //Wait for the route to be pushed into History( which means that the route is working fine. Remaining can be verified in E2E test)
    wait(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith('/tiles/run/add');
    })

  });

  test('Verify Mapping card allows step to be added to flow with writeFlow authority', async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(['readMapping','writeFlow']);
    const mappingStepName = mapping[0].name;
    const mockAddStepToFlow = jest.fn();
    const {getByText, getAllByText, getByTestId} = render(
      <MemoryRouter><AuthoritiesContext.Provider value={authorityService}><MappingCard
        {...mappingProps}
        canReadOnly={authorityService.canReadMapping()}
        canReadWrite={authorityService.canWriteMapping()}
        canWriteFlow={authorityService.canWriteFlow()}
        addStepToFlow={mockAddStepToFlow}
      />
      </AuthoritiesContext.Provider></MemoryRouter>
    );

    fireEvent.mouseOver(getByText(mappingStepName));

    // test adding to existing flow
    expect(getByTestId(`${mappingStepName}-toExistingFlow`)).toBeInTheDocument();
    fireEvent.click(getByTestId(`${mappingStepName}-flowsList`));
    fireEvent.click(getByText(data.flows.data[0].name));
    fireEvent.click(getByText('Yes'));
    expect(mockAddStepToFlow).toBeCalledTimes(1);

    // adding to new flow
    const mappingStep = getAllByText(mappingStepName);
    fireEvent.mouseOver(mappingStep[0]);
    expect(getByTestId(`${mappingStepName}-toNewFlow`)).toBeInTheDocument();
    // TODO calling addStepToNew not implemented yet

  });

  test('Verify Mapping card does not allow a step to be added to flow with readFlow authority only', async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(['readMapping','readFlow']);
    const mappingStepName = mapping[0].name;
    const mockAddStepToFlow = jest.fn();
    const {getByText, queryByText, queryByTestId} = render(
      <MemoryRouter><AuthoritiesContext.Provider value={authorityService}><MappingCard
        {...mappingProps}
        canReadOnly={authorityService.canReadMapping()}
        canReadWrite={authorityService.canWriteMapping()}
        canWriteFlow={authorityService.canWriteFlow()}
        addStepToFlow={mockAddStepToFlow}
      /></AuthoritiesContext.Provider></MemoryRouter>
    );

    fireEvent.mouseOver(getByText(mappingStepName));

    // test adding to existing flow
    expect(queryByTestId(`${mappingStepName}-toExistingFlow`)).toBeInTheDocument();
    fireEvent.click(queryByTestId(`${mappingStepName}-flowsList`));
    expect(queryByText(data.flows.data[0].name)).not.toBeInTheDocument();

    // test adding to new flow
    expect(queryByTestId(`${mappingStepName}-toNewFlow`)).not.toBeInTheDocument();
    expect(queryByTestId(`${mappingStepName}-disabledToNewFlow`)).toBeInTheDocument();

  });
});
