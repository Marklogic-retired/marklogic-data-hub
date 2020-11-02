import React from 'react';
import {render, fireEvent, wait, cleanup, screen} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoadCard from './load-card';
import data from '../../assets/mock-data/curation/common.data';
import ingestionData from '../../assets/mock-data/curation/ingestion.data';
import axiosMock from 'axios';
import mocks from '../../api/__mocks__/mocks.data';
import { AuthoritiesService, AuthoritiesContext } from '../../util/authorities';
import {SecurityTooltips} from "../../config/tooltips.config";
jest.mock('axios');

const mockHistoryPush = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('Load Card component', () => {

  beforeEach(() => {
    mocks.loadAPI(axiosMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test('Load Card - Add step to an existing flow and run step in an existing flow where step DOES NOT exist', async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(['readIngestion', 'writeIngestion', 'writeFlow']);
    const { getByText, getByLabelText, getByTestId } = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadCard
            {...data.loadData}
            flows={data.flowsAdd}
            canWriteFlow={true}
            addStepToFlow={jest.fn()}
            addStepToNew={jest.fn()} />
        </AuthoritiesContext.Provider>
      </MemoryRouter>
    );

    //Check if the card is rendered properly
    expect(getByText('Add New')).toBeInTheDocument();
    expect(getByText('testLoadXML')).toBeInTheDocument();
    expect(getByLabelText('testLoadXML-sourceFormat')).toBeInTheDocument();
    expect(getByText('Last Updated: 04/15/2020 2:22PM')).toBeInTheDocument();

    fireEvent.mouseOver(getByText('testLoadXML')); // Hover over the Load Card to get more options

    //Verify if the flow related options are availble on mouseOver
    expect(getByTestId('testLoadXML-toNewFlow')).toBeInTheDocument(); // check if option 'Add to a new Flow' is visible
    expect(getByTestId('testLoadXML-toExistingFlow')).toBeInTheDocument(); // check if option 'Add to an existing Flow' is visible

    //Click on the select field to open the list of existing flows.
    fireEvent.click(getByTestId('testLoadXML-flowsList'));

    //Choose FlowStepNoExist from the dropdown
    fireEvent.click(getByText('FlowStepNoExist'));

    //Dialog appears, click 'Yes' button
    expect(getByLabelText('step-not-in-flow')).toBeInTheDocument();
    fireEvent.click(getByTestId('testLoadXML-to-FlowStepNoExist-Confirm'));

    //Check if the /tiles/run/add route has been called
    wait(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith('/tiles/run/add');
    });
    //TODO- E2E test to check if the Run tile is loaded or not.

  });

  test('Load Card - Run step in an existing flow where step DOES NOT exist', async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(['readIngestion', 'writeIngestion', 'writeFlow']);
    const { getByLabelText, getByTestId } = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadCard
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

  test('Load Card - Add step to an existing flow where step DOES exist', async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(['readIngestion', 'writeIngestion', 'writeFlow']);
    const { getByText, getByLabelText, getByTestId } = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadCard
            {...data.loadData}
            flows={data.flowsAdd}
            canWriteFlow={true}
            addStepToFlow={jest.fn()}
            addStepToNew={jest.fn()} />
        </AuthoritiesContext.Provider>
      </MemoryRouter>
    );

    fireEvent.mouseOver(getByText('testLoadXML')); // Hover over the Load Card to get more options

    //Click on the select field to open the list of existing flows.
    fireEvent.click(getByTestId('testLoadXML-flowsList'));

    //Choose FlowStepExist from the dropdown
    fireEvent.click(getByText('FlowStepExist'));

    //Dialog appears, click 'Yes' button
    expect(getByLabelText('step-in-flow')).toBeInTheDocument();
    fireEvent.click(getByTestId('testLoadXML-to-FlowStepExist-Confirm'));
  });

  test('Load Card - Run step in an existing flow where step DOES exist', async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(['readIngestion', 'writeIngestion', 'writeFlow']);
    const { getByLabelText, getByTestId } = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadCard
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

  test('Load Card - Verify card sort order and Add step to a new Flow', async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(['readIngestion', 'writeIngestion', 'writeFlow']);
    const { getByText, getByLabelText, getByTestId } = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadCard
            {...data.loadData}
            flows={data.flows}
            canWriteFlow={true}
            addStepToFlow={jest.fn()}
            addStepToNew={jest.fn()} />
        </AuthoritiesContext.Provider>
      </MemoryRouter>
    );

    //Verify cards get sorted by last updated
    let loadCards: any = document.querySelectorAll('.ant-col');
    expect(loadCards[0]).toHaveTextContent('Add New');
    expect(loadCards[1]).toHaveTextContent('testLoadXML');
    expect(loadCards[2]).toHaveTextContent('testLoad123');
    expect(loadCards[3]).toHaveTextContent('testLoad');

    //Check if the card is rendered properly
    expect(getByText('Add New')).toBeInTheDocument();
    expect(getByText('testLoadXML')).toBeInTheDocument();
    expect(getByLabelText('testLoadXML-sourceFormat')).toBeInTheDocument();
    expect(getByText('Last Updated: 04/15/2020 2:22PM')).toBeInTheDocument();

    fireEvent.mouseOver(getByText('testLoadXML')); // Hover over the Load Card to get more options

    //Verify if the flow related options are availble on mouseOver
    expect(getByTestId('testLoadXML-toNewFlow')).toBeInTheDocument(); // check if option 'Add to a new Flow' is visible
    expect(getByTestId('testLoadXML-toExistingFlow')).toBeInTheDocument(); // check if option 'Add to an existing Flow' is visible

    // check if delete tooltip appears
    fireEvent.mouseOver(getByTestId('testLoadXML-delete'));
    await wait (() => expect(getByText('Delete')).toBeInTheDocument());

    //Click on the select field to open the list of existing flows.
    fireEvent.click(getByTestId('testLoadXML-toNewFlow'));

    //Wait for the route to be pushed into History(which means that the route is working fine. Remaining can be verified in E2E test)
    wait(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith('/tiles/run/add');
    });
    //TODO- E2E test to check if the Run tile is loaded or not.


    //Verify run step in a new flow 

    //Click play button 'Run' icon
    fireEvent.click(getByTestId('testLoadXML-run'));

    //'Run in a new Flow'
    fireEvent.click(getByTestId('testLoadXML-run-toNewFlow'));

    //Check if the /tiles/run/add-run route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith('/tiles/run/add-run'); })

  });

  test('Verify Load card allows step to be added to flow with writeFlow authority', async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(['readIngestion','writeFlow']);
    const mockAddStepToFlow = jest.fn();
    const mockAddStepToNew = jest.fn();
    const mockCreateLoadArtifact = jest.fn();
    const mockDeleteLoadArtifact = jest.fn();
    const {getByText, getAllByText, getByTestId} = render(<MemoryRouter><AuthoritiesContext.Provider value={authorityService}><LoadCard
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
    fireEvent.mouseOver(getByText(loadStepName));

    // test adding to existing flow
    expect(getByTestId(`${loadStepName}-toExistingFlow`)).toBeInTheDocument();
    fireEvent.click(getByTestId(`${loadStepName}-flowsList`));
    fireEvent.click(getByText(data.flows[0].name));
    fireEvent.click(getByText('Yes'));
    expect(mockAddStepToFlow).toBeCalledTimes(1);
    // adding to new flow
    const loadSteps = getAllByText(loadStepName);
    fireEvent.mouseOver(loadSteps[0]);
    expect(getByTestId(`${loadStepName}-toNewFlow`)).toBeInTheDocument();
    // TODO calling addStepToNew not implemented yet
  });

  test('Verify Load card does not allow a step to be added to flow and run in a flow with readFlow authority only', async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(['readIngestion','readFlow']);
    const {getByText, queryByTestId, getByTestId, queryByText, getByRole} = render(<MemoryRouter><AuthoritiesContext.Provider value={authorityService}><LoadCard
      {...ingestionData.loadCardProps}
      data={data.loadData.data}
      flows={data.flows}/>
    </AuthoritiesContext.Provider></MemoryRouter>);

    fireEvent.mouseOver(getByText(data.loadData.data[0].name));

    const loadStepName = data.loadData.data[0].name;

    // test delete icon displays correct tooltip when disabled
    fireEvent.mouseOver(getByTestId(loadStepName + '-disabled-delete'));
    await wait (() => expect(screen.getByText('Delete: ' + SecurityTooltips.missingPermission)).toBeInTheDocument());

    // test run icon displays correct tooltip when disabled
    fireEvent.mouseOver(getByTestId(`${loadStepName}-disabled-run`));
    await wait (() => expect(getByText('Run: ' + SecurityTooltips.missingPermission)).toBeInTheDocument());
 
    await fireEvent.click(getByTestId(`${loadStepName}-disabled-run`));
    expect(queryByTestId(`${loadStepName}-run-flowsList`)).not.toBeInTheDocument();

    // adding to new flow
    fireEvent.mouseOver(getByText(loadStepName));
    // test adding to existing flow
    expect(queryByTestId(`${loadStepName}-toExistingFlow`)).toBeInTheDocument();
    fireEvent.click(queryByTestId(`${loadStepName}-flowsList`));
    expect(queryByText(data.flows[0].name)).not.toBeInTheDocument();

    // test adding to new flow
    fireEvent.mouseOver(getByText(loadStepName));
    fireEvent.click(getByTestId(`${loadStepName}-toNewFlow`));
    await wait(() => {
        expect(mockHistoryPush).not.toHaveBeenCalledWith('/tiles/run/add');
    });
  });
});
