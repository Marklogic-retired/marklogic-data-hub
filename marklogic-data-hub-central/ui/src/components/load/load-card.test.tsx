import React from 'react';
import { render, fireEvent, wait, cleanup, waitForElement } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoadCard from './load-card';
import data from '../../config/test-data.config';
import axiosMock from 'axios';
import mocks from '../../config/mocks.config';
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

    //Check if the tiles-run route has been called
    wait(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith('/tiles-run');
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
      expect(mockHistoryPush).toHaveBeenCalledWith('/tiles-run');
    })
    //TODO- E2E test to check if the Run tile is loaded or not.

  });

});
