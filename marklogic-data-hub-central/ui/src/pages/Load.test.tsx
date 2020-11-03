import React from 'react';
import { render, fireEvent, wait, waitForElement, act, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {AuthoritiesContext, AuthoritiesService} from '../util/authorities';
import axiosMock from 'axios';
import mocks from '../api/__mocks__/mocks.data';
import Load from "./Load";
import {MemoryRouter} from "react-router-dom";
import tiles from '../config/tiles.config';

jest.mock('axios');
jest.setTimeout(30000);

const DEFAULT_VIEW = 'card';

describe('Load component', () => {

    beforeEach(() => {
        mocks.loadAPI(axiosMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    test('Verify cannot edit with only readIngestion authority', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readIngestion']);

        const { debug, baseElement, getByText, getByPlaceholderText, getAllByText, getByLabelText, getByTestId, queryByTestId, queryByText, queryByTitle } = render(
          <MemoryRouter><AuthoritiesContext.Provider value={authorityService}><Load/></AuthoritiesContext.Provider></MemoryRouter>
        );

        expect(await(waitForElement(() => getByLabelText('switch-view-list')))).toBeInTheDocument();

        // Check for steps to be populated
        expect(axiosMock.get).toBeCalledWith('/api/steps/ingestion');
        expect(getByText('testLoad')).toBeInTheDocument();

        // Check list view
        fireEvent.click(getByLabelText('switch-view-list'));
        // test 'Add New' button
        expect(queryByText('Add New')).not.toBeInTheDocument();

        // Open settings
        await act(async () => {
            await fireEvent.click(getByText('testLoad'));
        });
        expect(getByText('Loading Step Settings')).toBeInTheDocument();
        expect(getByText('Basic')).toHaveClass('ant-tabs-tab-active');
        expect(getByText('Advanced')).not.toHaveClass('ant-tabs-tab-active');

        // Basic settings
        expect(getByPlaceholderText('Enter name')).toHaveValue('testLoad');
        expect(getByPlaceholderText('Enter name')).toBeDisabled();
        expect(getByPlaceholderText('Enter description')).toBeDisabled();
        expect(baseElement.querySelector('#sourceFormat')).toHaveClass('ant-select-disabled');
        expect(baseElement.querySelector('#targetFormat')).toHaveClass('ant-select-disabled');
        expect(baseElement.querySelector('#outputUriPrefix')).toHaveClass('ant-input-disabled');

        // Advanced settings
        await wait(() => {
            fireEvent.click(getByText('Advanced'));
        });
        expect(getByText('Basic')).not.toHaveClass('ant-tabs-tab-active');
        expect(getByText('Advanced')).toHaveClass('ant-tabs-tab-active');
        debug();
        expect(await(waitForElement(() => getByText('Target Database')))).toBeInTheDocument();
        expect(getByLabelText('headers-textarea')).toBeDisabled();
        fireEvent.click(getByText('Processors'));
        expect(getByLabelText('processors-textarea')).toBeDisabled();
        fireEvent.click(getByText('Custom Hook'));
        expect(getByLabelText('customHook-textarea')).toBeDisabled();
        expect(getByTestId('testLoad-save-settings')).toBeDisabled();
        await act(async () => {
            await fireEvent.click(getByTestId('testLoad-cancel-settings'));
        });

        // test delete
        expect(queryByTestId('testLoad-delete')).not.toBeInTheDocument();

        // Check card layout
        fireEvent.click(getByLabelText('switch-view-card'));

        // test 'Add New' button
        expect(queryByText('Add New')).not.toBeInTheDocument();

        // test delete
        expect(queryByTitle('delete')).not.toBeInTheDocument();
    });

    test('Verify edit with readIngestion and writeIngestion authorities', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readIngestion','writeIngestion']);

        const { debug, baseElement, getByText, getAllByText, getByLabelText, getByPlaceholderText, getByTestId, queryAllByText } = render(
          <MemoryRouter><AuthoritiesContext.Provider value={authorityService}><Load/></AuthoritiesContext.Provider></MemoryRouter>
        );

        expect(await(waitForElement(() => getByLabelText('switch-view-list')))).toBeInTheDocument();

        // Check for steps to be populated
        expect(axiosMock.get).toBeCalledWith('/api/steps/ingestion');
        expect(getByText('testLoad')).toBeInTheDocument();

        // Check list view
        fireEvent.click(getByLabelText('switch-view-list'));
        // test 'Add New' button
        expect(getByText('Add New')).toBeInTheDocument();

        // Open settings
        await act(async () => {
            await fireEvent.click(getByText('testLoad'));
        });
        expect(getByText('Loading Step Settings')).toBeInTheDocument();
        expect(getByText('Basic')).toHaveClass('ant-tabs-tab-active');
        expect(getByText('Advanced')).not.toHaveClass('ant-tabs-tab-active');

        // Basic settings
        expect(getByPlaceholderText('Enter name')).toHaveValue('testLoad');
        expect(getByPlaceholderText('Enter name')).toBeDisabled();
        expect(getByPlaceholderText('Enter description')).toBeEnabled();
        expect(baseElement.querySelector('#sourceFormat')).not.toHaveClass('ant-select-disabled');
        expect(baseElement.querySelector('#targetFormat')).not.toHaveClass('ant-select-disabled');
        expect(baseElement.querySelector('#outputUriPrefix')).not.toHaveClass('ant-input-disabled');

        // Advanced settings
        await wait(() => {
            fireEvent.click(getByText('Advanced'));
        });
        expect(getByText('Basic')).not.toHaveClass('ant-tabs-tab-active');
        expect(getByText('Advanced')).toHaveClass('ant-tabs-tab-active');
        expect(getByLabelText('headers-textarea')).not.toBeDisabled();
        fireEvent.click(getByText('Processors'));
        expect(getByLabelText('processors-textarea')).not.toBeDisabled();
        fireEvent.click(getByText('Custom Hook'));
        expect(getByLabelText('customHook-textarea')).not.toBeDisabled();

        // No JSON (empty field)
        fireEvent.change(getByLabelText('headers-textarea'), { target: { value: '' }});
        expect(queryAllByText('Invalid JSON').length === 0);
        fireEvent.change(getByLabelText('processors-textarea'), { target: { value: '' }});
        expect(queryAllByText('Invalid JSON').length === 0);
        fireEvent.change(getByLabelText('customHook-textarea'), { target: { value: '' }});
        expect(queryAllByText('Invalid JSON').length === 0);

        // Invalid JSON
        fireEvent.change(getByLabelText('headers-textarea'), { target: { value: '{"badJSON": "noClosingBracket"' }});
        expect(queryAllByText('Invalid JSON').length === 1);
        fireEvent.change(getByLabelText('processors-textarea'), { target: { value: '{"badJSON": "noClosingBracket"' }});
        expect(queryAllByText('Invalid JSON').length === 2);
        fireEvent.change(getByLabelText('customHook-textarea'), { target: { value: '{"badJSON": "noClosingBracket"' }});
        expect(queryAllByText('Invalid JSON').length === 3);

        // Valid JSON
        fireEvent.change(getByLabelText('headers-textarea'), { target: { value: '{"goodJSON": true}' }});
        expect(queryAllByText('Invalid JSON').length === 2);
        fireEvent.change(getByLabelText('processors-textarea'), { target: { value: '{"goodJSON": true}' }});
        expect(queryAllByText('Invalid JSON').length === 1);
        fireEvent.change(getByLabelText('customHook-textarea'), { target: { value: '{"goodJSON": true}' }});
        expect(queryAllByText('Invalid JSON').length === 0);

        expect(getByTestId('testLoad-save-settings')).not.toBeDisabled();
        fireEvent.click(getByTestId('testLoad-cancel-settings'));
        fireEvent.click(getAllByText('No')[0]); // Handle cancel confirmation

        // test delete
        fireEvent.click(getByTestId('testLoad-delete'));
        fireEvent.click(getAllByText('No')[1]);

        // Check card layout
        fireEvent.click(getByLabelText('switch-view-card'));
        // test 'Add New' button
        expect(getByText('Add New')).toBeInTheDocument();

        // test delete
        fireEvent.click(getByTestId('testLoad-delete'));
        expect(await(waitForElement(() => getByText('Yes')))).toBeInTheDocument();
        await act(async () => {
            fireEvent.click(getByText('Yes'));
        });
        expect(axiosMock.delete).toHaveBeenNthCalledWith(1,'/api/steps/ingestion/testLoad');
    });

    test('Verify list and card views', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readIngestion','writeIngestion']);

        const { getByText, getAllByText, getByLabelText, getByTestId } = render(
          <MemoryRouter><AuthoritiesContext.Provider value={authorityService}><Load/></AuthoritiesContext.Provider></MemoryRouter>
        );

        expect(await(waitForElement(() => getByLabelText('switch-view-list')))).toBeInTheDocument();

        expect(getByText(tiles.load.intro)).toBeInTheDocument(); // tile intro text

        // Check for steps to be populated in default view
        expect(axiosMock.get).toBeCalledWith('/api/steps/ingestion');
        expect(getByText('testLoad')).toBeInTheDocument();
        expect(getByLabelText('load-' + DEFAULT_VIEW)).toBeInTheDocument();

        // Check list view
        fireEvent.click(getByLabelText('switch-view-list'));
        expect(getByText('testLoad')).toBeInTheDocument();
        expect(getByText('Test JSON.')).toBeInTheDocument();
        expect(getAllByText('json').length > 0);
        expect(getByText('01/01/2000 4:00AM')).toBeInTheDocument();
        expect(getByLabelText('icon: delete')).toBeInTheDocument();

        // Check card view
        fireEvent.click(getByLabelText('switch-view-card'));
        expect(getByText('testLoad')).toBeInTheDocument();
        expect(getByText('JSON')).toBeInTheDocument();
        expect(getByText('Last Updated: 01/01/2000 4:00AM')).toBeInTheDocument();
        expect(getByTestId('testLoad-edit')).toBeInTheDocument();
        expect(getByLabelText('icon: delete')).toBeInTheDocument();

    });

});
