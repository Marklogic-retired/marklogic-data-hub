import React from 'react';
import { render, fireEvent, wait, cleanup, waitForElement } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoadCard from './load-card';
import data from '../../assets/mock-data/common.data';
import axiosMock from 'axios';
import mocks from '../../api/__mocks__/mocks.data';
import { AuthoritiesService, AuthoritiesContext } from '../../util/authorities';

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
  })

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  })

  test('Load Card - Add step to an existing Flow', async () => {
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
    )

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

    //Choose FlowA from the dropdown
    fireEvent.click(getByText('FlowA'));
    
    //Click on 'Yes' button
    fireEvent.click(getByTestId('testLoadXML-to-FlowA-Confirm'));

    //Check if the /tiles/run/add route has been called
    wait(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith('/tiles/run/add');
    })
    //TODO- E2E test to check if the Run tile is loaded or not.

  });

  test('Load Card - Add step to a new Flow', async () => {
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
    )

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
    fireEvent.click(getByTestId('testLoadXML-toNewFlow')); 

    //Wait for the route to be pushed into History(which means that the route is working fine. Remaining can be verified in E2E test)
    wait(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith('/tiles/run/add');
    })
    //TODO- E2E test to check if the Run tile is loaded or not.

  });

  test('Verify Load card allows step to be added to flow with writeFlow authority', async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(['readIngestion','writeFlow']);
    const mockAddStepToFlow = jest.fn();
    const mockAddStepToNew = jest.fn();
    const mockCreateLoadArtifact = jest.fn();
    const mockDeleteLoadArtifact = jest.fn();
    const {getByText, getByTestId} = render(<MemoryRouter><AuthoritiesContext.Provider value={authorityService}><LoadCard
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
    fireEvent.mouseOver(getByText(loadStepName));
    expect(getByTestId(`${loadStepName}-toNewFlow`)).toBeInTheDocument();
    // TODO calling addStepToNew not implemented yet
  });

  test('Verify Load card does not allow a step to be added to flow with readFlow authority only', async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(['readIngestion','readFlow']);
    const mockAddStepToFlow = jest.fn();
    const mockAddStepToNew = jest.fn();
    const mockCreateLoadArtifact = jest.fn();
    const mockDeleteLoadArtifact = jest.fn();
    const {getByText, queryByTestId, queryByText} = render(<MemoryRouter><AuthoritiesContext.Provider value={authorityService}><LoadCard
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

    fireEvent.mouseOver(getByText(data.loadData.data[0].name));

    const loadStepName = data.loadData.data[0].name;
    // adding to new flow
    fireEvent.mouseOver(getByText(loadStepName));
    // test adding to existing flow
    expect(queryByTestId(`${loadStepName}-toExistingFlow`)).toBeInTheDocument();
    fireEvent.click(queryByTestId(`${loadStepName}-flowsList`));
    expect(queryByText(data.flows[0].name)).not.toBeInTheDocument();

    // test adding to new flow
    expect(queryByTestId(`${loadStepName}-toNewFlow`)).not.toBeInTheDocument();
    expect(queryByTestId(`${loadStepName}-disabledToNewFlow`)).toBeInTheDocument();
  });
});
