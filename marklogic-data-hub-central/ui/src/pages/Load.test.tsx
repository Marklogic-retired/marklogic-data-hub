import React from 'react';
import { render, fireEvent, waitForElement, act, cleanup } from '@testing-library/react';
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

        const { getByText, getAllByText, getByLabelText, getByTestId, queryByTestId, queryByText, queryByTitle } = render(
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

        // test settings
        await act(async () => {
            await fireEvent.click(getByTestId('testLoad-settings'));
        });
        expect(await(waitForElement(() => getByText('Target Database')))).toBeInTheDocument();
        expect(getByLabelText('headers-textarea')).toBeDisabled();
        fireEvent.click(getByText('Processors'));
        expect(getByLabelText('processors-textarea')).toBeDisabled();
        fireEvent.click(getByText('Custom Hook'));
        expect(getByLabelText('customHook-textarea')).toBeDisabled();
        expect(getByText('Save')).toBeDisabled();
        await act(async () => {
            await fireEvent.click(getByText('Cancel'));
        });
        // test delete
        expect(queryByTestId('testLoad-delete')).not.toBeInTheDocument();

        //test edit
        fireEvent.click(getAllByText('testLoad')[0]);
        expect(getByText('Edit Loading Step')).toBeInTheDocument();
        expect(getAllByText('Save')[0]).toBeDisabled();
        fireEvent.click(getAllByText('Cancel')[0]);

        // Check card layout
        fireEvent.click(getByLabelText('switch-view-card'));

        // test 'Add New' button
        expect(queryByText('Add New')).not.toBeInTheDocument();

        // test settings
        await act(async () => {
            await fireEvent.click(getByLabelText('icon: setting'));
        });
        expect(await(waitForElement(() => getByText('Target Database')))).toBeInTheDocument();
        expect(getByText('Save')).toBeDisabled();
        await act(async () => {
            await fireEvent.click(getByText('Cancel'));
        });

        // test delete
        expect(queryByTitle('delete')).not.toBeInTheDocument();
    });

    test('Verify edit with readIngestion and writeIngestion authorities', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readIngestion','writeIngestion']);

        const { getByText, getAllByText, getByLabelText, getByTestId, queryAllByText } = render(
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

        // test settings
        fireEvent.click(getByTestId('testLoad-settings'));
        expect(await(waitForElement(() => getByText('Target Database')))).toBeInTheDocument();
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

        expect(getByText('Save')).not.toBeDisabled();
        fireEvent.click(getByText('Cancel'));
        fireEvent.click(getAllByText('No')[0]); // Handle cancel confirmation

        //test edit
        fireEvent.click(getAllByText('testLoad')[0]);
        expect(await(waitForElement(() => getByText('Edit Loading Step')))).toBeInTheDocument();
        expect(getAllByText('Save')[0]).not.toBeDisabled();
        fireEvent.click(getAllByText('Cancel')[0]);

        // test delete
        fireEvent.click(getByTestId('testLoad-delete'));
        fireEvent.click(getAllByText('No')[1]);

        // Check card layout
        fireEvent.click(getByLabelText('switch-view-card'));
        // test 'Add New' button
        expect(getByText('Add New')).toBeInTheDocument();

        // test settings
        fireEvent.click(getByLabelText('icon: setting'));
        expect(await(waitForElement(() => getByText('Target Database')))).toBeInTheDocument();
        expect(getByText('Save')).not.toBeDisabled();
        fireEvent.click(getByText('Cancel'));

        //test edit
        fireEvent.click(getByTestId('testLoad-edit'));
        expect(await(waitForElement(() => getByText('Edit Loading Step')))).toBeInTheDocument();
        expect(getAllByText('Save')[0]).not.toBeDisabled();
        fireEvent.click(getAllByText('Cancel')[0]);

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
        expect(getByLabelText('icon: setting')).toBeInTheDocument();
        expect(getByLabelText('icon: delete')).toBeInTheDocument();

        // Check card view
        fireEvent.click(getByLabelText('switch-view-card'));
        expect(getByText('testLoad')).toBeInTheDocument();
        expect(getByText('JSON')).toBeInTheDocument();
        expect(getByText('Last Updated: 01/01/2000 4:00AM')).toBeInTheDocument();
        expect(getByLabelText('icon: setting')).toBeInTheDocument();
        expect(getByTestId('testLoad-edit')).toBeInTheDocument();
        expect(getByLabelText('icon: delete')).toBeInTheDocument();

    });

});
