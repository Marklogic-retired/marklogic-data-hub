import React from 'react';
import { render, fireEvent, wait, within, cleanup, waitForElement, getByTestId } from '@testing-library/react';
import LoadList from './load-list';
import data from '../../assets/mock-data/curation/common.data';
import axiosMock from 'axios';
import mocks from '../../api/__mocks__/mocks.data';
import loadData from "../../assets/mock-data/curation/ingestion.data";
import { AdvancedSettingsMessages } from '../../config/messages.config';
import {MemoryRouter} from "react-router-dom";
import { AuthoritiesService, AuthoritiesContext } from '../../util/authorities';
import { validateTableRow } from '../../util/test-utils';
import { SecurityTooltips } from "../../config/tooltips.config";

jest.mock('axios');

const mockHistoryPush = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('Load data component', () => {

  beforeEach(() => {
      mocks.loadAPI(axiosMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test('Verify Load list view renders correctly with no data', () => {
    const { getByText } = render(<MemoryRouter><LoadList {...data.loadData} data={[]} /></MemoryRouter>);
    const tableColumns = within(getByText('Name').closest('tr'));

    expect(getByText('Add New')).toBeInTheDocument();
    expect(tableColumns.getByText('Name')).toBeInTheDocument();
    expect(tableColumns.getByText('Description')).toBeInTheDocument();
    expect(tableColumns.getByText('Source Format')).toBeInTheDocument();
    expect(tableColumns.getByText('Target Format')).toBeInTheDocument();
    expect(tableColumns.getByText('Last Updated')).toBeInTheDocument();
    expect(tableColumns.getByText('Action')).toBeInTheDocument();
    expect(getByText('No Data')).toBeInTheDocument();
  });

  test('Verify Load list view renders correctly with data', async () => {
    const { getByText, getAllByLabelText, getByTestId } = render(<MemoryRouter><LoadList {...data.loadData} /></MemoryRouter>);
    const dataRow = within(getByText('testLoadXML').closest('tr'));
    expect(dataRow.getByText(data.loadData.data[1].name)).toBeInTheDocument();
    expect(dataRow.getByText(data.loadData.data[1].description)).toBeInTheDocument();
    expect(dataRow.getByText(data.loadData.data[1].sourceFormat)).toBeInTheDocument();
    expect(dataRow.getByText(data.loadData.data[1].targetFormat)).toBeInTheDocument();
    expect(dataRow.getByText('04/15/2020 2:22PM')).toBeInTheDocument();
    expect(dataRow.getByTestId(`${data.loadData.data[1].name}-delete`)).toBeInTheDocument();

    // check if delete tooltip appears
    fireEvent.mouseOver(getByTestId(data.loadData.data[1].name + '-delete'));
    await wait (() => expect(getByText('Delete')).toBeInTheDocument());

    //verify load list table enforces last updated sort order by default
    let loadTable: any = document.querySelectorAll('.ant-table-row-level-0');
    validateTableRow(loadTable, ['testLoadXML', 'testLoad123','testLoad']);
    //verify load list table enforces sorting by ascending date updated as well
    let loadTableSort = getByTestId('loadTableDate');
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll('.ant-table-row-level-0');
    validateTableRow(loadTable, ['testLoad', 'testLoad123', 'testLoadXML']);
    //verify third click does not return to default, but returns to descending order
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll('.ant-table-row-level-0');
    validateTableRow(loadTable, ['testLoadXML', 'testLoad123','testLoad']);

    //verify load list table enforces sorting by name alphabetically in ascending order
    loadTableSort = getByTestId('loadTableName');
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll('.ant-table-row-level-0');
    validateTableRow(loadTable, ['testLoad', 'testLoad123', 'testLoadXML']);
    //verify load list table enforces sorting by name alphabetically in descending order
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll('.ant-table-row-level-0');
    validateTableRow(loadTable, ['testLoadXML', 'testLoad123', 'testLoad']);
    //verify third click does not return to default, but returns to ascending order
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll('.ant-table-row-level-0');
    validateTableRow(loadTable, ['testLoad', 'testLoad123', 'testLoadXML']);

    //verify load list table enforces sorting by source format alphabetically in ascending order
    loadTableSort = getByTestId('loadTableSourceFormat');
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll('.ant-table-row-level-0');
    validateTableRow(loadTable, ['testLoad123', 'testLoad', 'testLoadXML']);
    //verify load list table enforces sorting by source format alphabetically in descending order
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll('.ant-table-row-level-0');
    validateTableRow(loadTable, ['testLoad', 'testLoadXML', 'testLoad123']);
    //verify third click does not return to default, but returns to ascending order
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll('.ant-table-row-level-0');
    validateTableRow(loadTable, ['testLoad123', 'testLoad', 'testLoadXML']);

    //verify load list table enforces sorting by target format alphabetically in ascending order
    loadTableSort = getByTestId('loadTableTargetFormat');
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll('.ant-table-row-level-0');
    validateTableRow(loadTable, ['testLoad123', 'testLoad', 'testLoadXML']);
    //verify load list table enforces sorting by target format alphabetically in descending order
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll('.ant-table-row-level-0');
    validateTableRow(loadTable, ['testLoadXML', 'testLoad', 'testLoad123']);
    //verify third click does not return to default, but returns to ascending order
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll('.ant-table-row-level-0');
    validateTableRow(loadTable, ['testLoad123', 'testLoad', 'testLoadXML']);

    //verify load list table enforces sorting by Description alphabetically in ascending order
    loadTableSort = getByTestId('loadTableDescription');
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll('.ant-table-row-level-0');
    validateTableRow(loadTable, ['testLoad123', 'testLoad', 'testLoadXML']);
    //verify load list table enforces sorting by Description alphabetically in descending order
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll('.ant-table-row-level-0');
    validateTableRow(loadTable, ['testLoadXML', 'testLoad', 'testLoad123']);
    //verify third click does not return to default, but returns to ascending order
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll('.ant-table-row-level-0');
    validateTableRow(loadTable, ['testLoad123', 'testLoad', 'testLoadXML']);
  });

  test('Verify Load settings from list view renders correctly', async () => {
    const {getByText, getAllByText, getByTestId, getByTitle, queryByTitle, queryByText, getByPlaceholderText} = render(
      <MemoryRouter><LoadList {...data.loadData} /></MemoryRouter>
    );

    // Click name to open default Basic settings
    await wait(() => {
        fireEvent.click(getByText(data.loadData.data[0].name));
    });
    expect(getByText('Basic')).toHaveClass('ant-tabs-tab-active');
    expect(getByText('Advanced')).not.toHaveClass('ant-tabs-tab-active');

    // Basic settings values
    expect(getByText('testLoad')).toBeInTheDocument();
    expect(getByPlaceholderText("Enter description")).toBeInTheDocument();
    expect(getAllByText('JSON').length === 2);
    expect(getByPlaceholderText("Enter URI Prefix")).toBeInTheDocument();
    // Note: Can't test mock API call since is being called by <Load> parent, which isn't being rendered in this test

    // Switch to Advanced settings
    await wait(() => {
      fireEvent.click(getByText('Advanced'));
    });
    expect(axiosMock.get).toBeCalledWith('/api/steps/ingestion/' + data.loadData.data[0].name);
    expect(getByText('Basic')).not.toHaveClass('ant-tabs-tab-active');
    expect(getByText('Advanced')).toHaveClass('ant-tabs-tab-active');
    let saveButton = getAllByText('Save'); // Each tab has a Save button
    let stepName = loadData.loads.data[0].name;
    let targetCollection = getByTitle('addedCollection'); // Additional target collection (Added by user)
    
    // Advanced settings values
    expect(getByText('Target Collections')).toBeInTheDocument();
    expect(targetCollection).toBeInTheDocument(); //Should be available in the document
    expect(targetCollection).not.toBe(stepName); //Should not be same as the default collection
    expect(getByText('Default Collections')).toBeInTheDocument();
    expect(getByTestId('defaultCollections-' + stepName)).toBeInTheDocument();
    expect(queryByTitle(stepName)).not.toBeInTheDocument();  // The default collection should not be a part of the Target Collection list
    expect(getByText('Batch Size')).toBeInTheDocument();
    expect(getByPlaceholderText('Please enter batch size')).toHaveValue('35');

    // Update permissions
    let targetPermissions = getByPlaceholderText("Please enter target permissions");

    fireEvent.change(targetPermissions, { target: { value: 'role1' }}); // BAD permissions
    expect(targetPermissions).toHaveValue('role1');
    fireEvent.blur(targetPermissions);
    expect(getByTestId('validationError')).toHaveTextContent(AdvancedSettingsMessages.targetPermissions.incorrectFormat);

    fireEvent.change(targetPermissions, { target: { value: 'role1,reader' }}); // BAD permissions
    expect(targetPermissions).toHaveValue('role1,reader');
    fireEvent.blur(targetPermissions);
    expect(getByTestId('validationError')).toHaveTextContent(AdvancedSettingsMessages.targetPermissions.invalidCapabilities);

    fireEvent.change(targetPermissions, { target: { value: ' ' }}); // BAD permissions
    expect(targetPermissions).toHaveValue(' ');
    fireEvent.blur(targetPermissions);
    expect(getByTestId('validationError')).toHaveTextContent(AdvancedSettingsMessages.targetPermissions.incorrectFormat);

    fireEvent.change(targetPermissions, { target: { value: 'role1,read' }}); // GOOD permissions
    expect(targetPermissions).toHaveValue('role1,read');
    fireEvent.blur(targetPermissions);
    expect(getByTestId('validationError')).toHaveTextContent('');

  });

  test('Load List - Add step to an existing flow where step DOES NOT exist', async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(['readIngestion', 'writeIngestion', 'writeFlow']);
    const { getByText, getByLabelText, getByTestId } = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadList
            {...data.loadData}
            flows={data.flowsAdd}
            canWriteFlow={true}
            addStepToFlow={jest.fn()}
            addStepToNew={jest.fn()} />
        </AuthoritiesContext.Provider>
      </MemoryRouter>
    );

    //Check if the list is rendered properly
    expect(getByText('testLoadXML')).toBeInTheDocument();

    fireEvent.click(getByLabelText('testLoadXML-add-icon')); // Click the Add to Flow Icon to get more options

    //Verify if the flow related options are availble on click
    await waitForElement(() => expect(getByTestId(`testLoadXML-toNewFlow`))); // check if option 'Add to a new Flow' is visible
    await waitForElement(() => expect(getByTestId(`testLoadXML-toExistingFlow`))); // check if option 'Add to an existing Flow' is visible

    //Click on the select field to open the list of existing flows.
    fireEvent.click(getByTestId('testLoadXML-flowsList'));

    //Choose FlowStepNoExist from the dropdown
    fireEvent.click(getByText('FlowStepNoExist'));

    //Dialog appears, click 'Yes' button
    expect(getByLabelText('step-not-in-flow')).toBeInTheDocument();
    fireEvent.click(getByLabelText('Yes'));

    //Check if the /tiles/run/add route has been called
    wait(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith('/tiles/run/add');
    });
    //TODO- E2E test to check if the Run tile is loaded or not.

  });

  test('Load List - Add step to an existing flow where step DOES exist', async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(['readIngestion', 'writeIngestion', 'writeFlow']);
    const { getByText, getByLabelText, getByTestId } = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadList
            {...data.loadData}
            flows={data.flowsAdd}
            canWriteFlow={true}
            addStepToFlow={jest.fn()}
            addStepToNew={jest.fn()} />
        </AuthoritiesContext.Provider>
      </MemoryRouter>
    );

    fireEvent.click(getByLabelText('testLoadXML-add-icon')); // Clik over the Add to Flow Icon to get more options

    //Verify if the flow related options are availble on click
    await waitForElement(() => expect(getByTestId(`testLoadXML-toNewFlow`))); // check if option 'Add to a new Flow' is visible
    await waitForElement(() => expect(getByTestId(`testLoadXML-toExistingFlow`))); // check if option 'Add to an existing Flow' is visible

    //Click on the select field to open the list of existing flows.
    fireEvent.click(getByTestId('testLoadXML-flowsList'));

    //Choose FlowStepExist from the dropdown
    fireEvent.click(getByText('FlowStepExist'));

    //Dialog appears, click 'Yes' button
    expect(getByLabelText('step-in-flow')).toBeInTheDocument();
    fireEvent.click(getByLabelText('Yes'));

  });

  test('Load List - Run step in an existing flow where step DOES NOT exist', async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(['readIngestion', 'writeIngestion', 'writeFlow']);
    const { getByLabelText, getByTestId } = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadList
            {...data.loadData}
            flows={data.flowsAdd}
            canWriteFlow={true}
            addStepToFlow={jest.fn()}
            addStepToNew={jest.fn()} />
        </AuthoritiesContext.Provider>
      </MemoryRouter>
    )

    //Verify run step in an existing flow where step does not exist yet

    //Click play button 'Run' icon
    fireEvent.click(getByTestId('testLoadXML-run'));

    //'Run in an existing Flow'
    fireEvent.click(getByTestId('testLoadXML-run-flowsList'));
    fireEvent.click(getByLabelText('FlowStepNoExist-run-option'));

    //Dialog appears, click 'Yes' button
    expect(getByLabelText('step-not-in-flow-run')).toBeInTheDocument();
    fireEvent.click(getByTestId('testLoadXML-to-FlowStepNoExist-Confirm'));

    //Check if the /tiles/run/add-run route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith('/tiles/run/add-run'); })

  });

  test('Load List - Run step in an existing flow where step DOES exist', async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(['readIngestion', 'writeIngestion', 'writeFlow']);
    const { getByLabelText, getByTestId } = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadList
            {...data.loadData}
            flows={data.flowsAdd}
            canWriteFlow={true}
            addStepToFlow={jest.fn()}
            addStepToNew={jest.fn()} />
        </AuthoritiesContext.Provider>
      </MemoryRouter>
    )

    //Click play button 'Run' icon
    fireEvent.click(getByTestId('testLoadXML-run'));

    //'Run in an existing Flow'
    fireEvent.click(getByTestId('testLoadXML-run-flowsList'));
    fireEvent.click(getByLabelText('FlowStepExist-run-option'));

    //Dialog appears, click 'Yes' button
    expect(getByLabelText('step-in-flow-run')).toBeInTheDocument();
    fireEvent.click(getByTestId('testLoadXML-to-FlowStepExist-Confirm'));

    //Check if the /tiles/run/add-run route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith('/tiles/run/add-run'); })
  });

  test('Load List - Add step to an new Flow', async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(['readIngestion', 'writeIngestion', 'writeFlow']);
    const { getByText, getByLabelText, getByTestId } = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadList
            {...data.loadData}
            flows={data.flows}
            canWriteFlow={true}
            addStepToFlow={jest.fn()}
            addStepToNew={jest.fn()} />
        </AuthoritiesContext.Provider>
      </MemoryRouter>
    );

    //Check if the list is rendered properly
    expect(getByText('testLoadXML')).toBeInTheDocument();

    fireEvent.click(getByLabelText('testLoadXML-add-icon')); // Click over the Add to Flow Icon to get more options

    //Verify if the flow related options are availble on mouseOver
    await waitForElement(() => expect(getByTestId(`testLoadXML-toNewFlow`))); // check if option 'Add to a new Flow' is visible
    await waitForElement(() => expect(getByTestId(`testLoadXML-toExistingFlow`))); // check if option 'Add to an existing Flow' is visible

    //Click on the select field to open the list of existing flows.
    fireEvent.click(getByTestId('testLoadXML-toNewFlow'));

    //Check if the /tiles/run/add route has been called
    wait(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith('/tiles/run/add');
    });
    //TODO- E2E test to check if the Run tile is loaded or not.

  });

  test('Verify Load list allows step to be added to flow with writeFlow authority', async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(['readIngestion','writeFlow']);
    const mockAddStepToFlow = jest.fn();
    const mockAddStepToNew = jest.fn();
    const mockCreateLoadArtifact = jest.fn();
    const mockDeleteLoadArtifact = jest.fn();
    const {getByText, getByLabelText, getByTestId} = render(<MemoryRouter><AuthoritiesContext.Provider value={authorityService}><LoadList
      addStepToFlow={mockAddStepToFlow}
      addStepToNew={mockAddStepToNew}
      canReadOnly={authorityService.canReadLoad()}
      canReadWrite={authorityService.canWriteLoad()}
      canWriteFlow={authorityService.canWriteFlow()}
      createLoadArtifact={mockCreateLoadArtifact}
      data={data.loadData.data}
      deleteLoadArtifact={mockDeleteLoadArtifact}
      flows={data.flows}/>
    </AuthoritiesContext.Provider></MemoryRouter>);

    const loadStepName = data.loadData.data[0].name;

    fireEvent.click(getByLabelText('testLoad-add-icon'));

    //verify components and text appear on click
    await waitForElement(() => expect(getByTestId(`${loadStepName}-toNewFlow`)));
    await waitForElement(() => expect(getByTestId(`${loadStepName}-toExistingFlow`)));
    await waitForElement(() => expect(getByTestId(`${loadStepName}-flowsList`)));
    await waitForElement(() => expect(getByText('Add step to a new flow')));
    await waitForElement(() => expect(getByText('Add step to an existing flow')));

    // test adding to existing flow
    fireEvent.click(getByTestId(`${loadStepName}-flowsList`));
    fireEvent.click(getByText(data.flows[0].name));
    fireEvent.click(getByText('Yes'));
    expect(mockAddStepToFlow).toBeCalledTimes(1);

    //TODO: Mock addStepToNew not implemented yet
  });

  test('Verify Load list does not allow a step to be added to flow or run in a flow with readFlow authority only', async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(['readIngestion','readFlow']);
    const mockAddStepToFlow = jest.fn();
    const mockAddStepToNew = jest.fn();
    const mockCreateLoadArtifact = jest.fn();
    const mockDeleteLoadArtifact = jest.fn();
    const {getByText, queryByTestId, getByLabelText, getByTestId, queryByText, getByRole} = render(<MemoryRouter><AuthoritiesContext.Provider value={authorityService}><LoadList
      addStepToFlow={mockAddStepToFlow}
      addStepToNew={mockAddStepToNew}
      canReadOnly={authorityService.canReadLoad()}
      canReadWrite={authorityService.canWriteLoad()}
      canWriteFlow={authorityService.canWriteFlow()}
      createLoadArtifact={mockCreateLoadArtifact}
      data={data.loadData.data}
      deleteLoadArtifact={mockDeleteLoadArtifact}
      flows={data.flows}/>
    </AuthoritiesContext.Provider></MemoryRouter>);
    const loadStepName = data.loadData.data[0].name;
    // adding to new flow icon is disabled and shows correct tooltip
    fireEvent.mouseOver(getByLabelText(`${loadStepName}-disabled-add-icon`));
    await wait (() => expect(getByText('Add to Flow: ' + SecurityTooltips.missingPermission)).toBeInTheDocument());


    // test adding to existing flow option does not appear
    expect(queryByTestId(`${loadStepName}-toExistingFlow`)).not.toBeInTheDocument();
    expect(queryByText(data.flows[0].name)).not.toBeInTheDocument();

    // test adding to new flow option does not appear
    expect(queryByTestId(`${loadStepName}-toNewFlow`)).not.toBeInTheDocument();

    // test delete icon displays correct tooltip when disabled
    fireEvent.mouseOver(getByTestId(loadStepName + '-disabled-delete'));
    await wait (() => expect(getByText('Delete: ' + SecurityTooltips.missingPermission)).toBeInTheDocument());

    // test run icon displays correct tooltip when disabled
    fireEvent.mouseOver(getByTestId(loadStepName + '-disabled-run'));
    await wait (() => expect(getByText('Run: ' + SecurityTooltips.missingPermission)).toBeInTheDocument());

    await fireEvent.click(getByTestId(loadStepName + '-disabled-run'));
    expect(queryByTestId(`${loadStepName}-run-flowsList`)).not.toBeInTheDocument()
  })

});
