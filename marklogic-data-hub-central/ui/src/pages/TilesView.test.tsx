import React from 'react';
import { Router } from 'react-router'
import { createMemoryHistory } from 'history'
const history = createMemoryHistory()
import { render, fireEvent, waitForElement, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import TilesView from './TilesView';
import {AuthoritiesContext, AuthoritiesService} from '../util/authorities';
import axiosMock from 'axios';
import mocks from '../api/__mocks__/mocks.data';
import authorities from '../assets/authorities.testutils';
import tiles from '../config/tiles.config'
import { SearchContext } from '../util/search-context';
import {
    setViewCurateFunction,
    setViewLoadFunction,
    setViewRunFunction
} from '../assets/mock-data/search-context-mock';

jest.mock('axios');
jest.setTimeout(30000);

const mockDevRolesService = authorities.DeveloperRolesService;
const testWithOperator = authorities.OperatorRolesService;


describe('Tiles View component tests for Developer user', () => {

    beforeEach(() => {
        mocks.curateAPI(axiosMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    })

    test('Verify TilesView renders with the toolbar', async () => {
        const { getByLabelText } = render(<Router history={history}>
            <AuthoritiesContext.Provider value={mockDevRolesService}><TilesView/></AuthoritiesContext.Provider> />
          </Router>);

        expect(getByLabelText("toolbar")).toBeInTheDocument();

        expect(getByLabelText("tool-load")).toBeInTheDocument();
        expect(getByLabelText('tool-load')).toHaveStyle('color: rgb(82, 3, 57);')
        expect(getByLabelText("tool-model")).toBeInTheDocument();
        expect(getByLabelText('tool-model')).toHaveStyle('color: rgb(34, 7, 94);')
        expect(getByLabelText("tool-curate")).toBeInTheDocument();
        expect(getByLabelText('tool-curate')).toHaveStyle('color: rgb(188, 129, 29);')
        expect(getByLabelText("tool-run")).toBeInTheDocument();
        expect(getByLabelText('tool-run')).toHaveStyle('color: rgb(6, 17, 120);')
        expect(getByLabelText("tool-explore")).toBeInTheDocument();
        expect(getByLabelText('tool-explore')).toHaveStyle('color: rgb(0, 71, 79);')

        expect(getByLabelText("overview")).toBeInTheDocument();

    });

    test('Verify tiles can be closed', async () => {
        const tools = Object.keys(tiles);
        const { getByLabelText } = render(<Router history={history}>
            <AuthoritiesContext.Provider value={mockDevRolesService}>
                <TilesView/>
            </AuthoritiesContext.Provider>
        </Router>);

        expect(getByLabelText("overview")).toBeInTheDocument();

        // Click close icon for each tile to return to overview
        tools.forEach(async (tool, i) => {
            expect(getByLabelText("tool-" + tool)).toBeInTheDocument();
            fireEvent.click(getByLabelText("tool-" + tool));
            expect(await(waitForElement(() => getByLabelText("icon-" + tool)))).toBeInTheDocument();
            expect(await(waitForElement(() => getByLabelText("close")))).toBeInTheDocument();
            fireEvent.click(getByLabelText("close"));
            expect(getByLabelText("overview")).toBeInTheDocument();
        })

    });

    test('Verify Curate tile displays from toolbar', async () => {
        const {getByLabelText, getByText, queryByText, debug} = render(<Router history={history}>
            <AuthoritiesContext.Provider value={mockDevRolesService}>
                <SearchContext.Provider value={setViewCurateFunction}>
                <TilesView/>
            </SearchContext.Provider>
            </AuthoritiesContext.Provider>
        </Router>);

        // Curate tile not shown initially
        expect(queryByText("icon-curate")).not.toBeInTheDocument();
        expect(queryByText("title-curate")).not.toBeInTheDocument();

        fireEvent.click(getByLabelText("tool-curate"));

        // Curate tile shown with entityTypes after click
        expect(await(waitForElement(() => getByLabelText("icon-curate")))).toBeInTheDocument();
        expect(getByLabelText("title-curate")).toBeInTheDocument();

        expect(getByText('Customer')).toBeInTheDocument();
        //debug(getByText('Customer'));

        fireEvent.click(getByText('Customer'));

        fireEvent.mouseOver(getByText('Mapping1'));

        expect(getByText('Open step details'));
        expect(getByText('Add step to a new flow'));
        expect(getByText('Add step to an existing flow'));
    });

    test('Verify Load tile displays from toolbar with readIngestion authority', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readIngestion']);
        const {getByLabelText, getByText, queryByText} = render(<Router history={history}>
            <AuthoritiesContext.Provider value={authorityService}>
                <SearchContext.Provider value={setViewLoadFunction}>
                    <TilesView/>
                </SearchContext.Provider>
            </AuthoritiesContext.Provider>
            </Router>);

        // Curate tile not shown initially
        expect(queryByText("icon-load")).not.toBeInTheDocument();
        expect(queryByText("title-load")).not.toBeInTheDocument();

        fireEvent.click(getByLabelText("tool-load"));

        // Load tile shown with entityTypes after click
        expect(await(waitForElement(() => getByLabelText("icon-load")))).toBeInTheDocument();
        expect(getByLabelText("title-load")).toBeInTheDocument();
        expect(getByText('testLoad')).toBeInTheDocument();
    });

    test('Verify Load tile does not load from toolbar without readIngestion authority', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities([]);
        const {getByLabelText, queryByLabelText, queryByText} = render(<Router history={history}>
            <AuthoritiesContext.Provider value={authorityService}> <SearchContext.Provider value={setViewLoadFunction}>
                <TilesView/>
            </SearchContext.Provider></AuthoritiesContext.Provider>
            </Router>);

        // Curate tile not shown initially
        expect(queryByText("icon-load")).not.toBeInTheDocument();
        expect(queryByText("title-load")).not.toBeInTheDocument();

        await fireEvent.click(getByLabelText("tool-load"));

        // Load tile shown with entityTypes after click
        expect(queryByLabelText("title-load")).not.toBeInTheDocument();
        expect(queryByText('testLoad')).not.toBeInTheDocument();
    });

    test('Verify readIngestion authority cannot access other tiles', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readIngestion']);
        const {getByLabelText, queryByLabelText, queryByText} = render(<Router history={history}>
            <AuthoritiesContext.Provider value={authorityService}><TilesView/></AuthoritiesContext.Provider>
        </Router>);

        ['model', 'curate', 'run'].forEach((tileId) => {
            // Curate tile not shown initially
            expect(queryByText("icon-"+tileId)).not.toBeInTheDocument();
            expect(queryByText("title-"+tileId)).not.toBeInTheDocument();

            fireEvent.click(getByLabelText("tool-"+tileId));

            // Other tile not shown after click
            expect(queryByLabelText("title-"+tileId)).not.toBeInTheDocument();
        });

    });

    test('Verify Curate tile with customRead authority', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readCustom']);
        const { getByLabelText, queryByText, getByText } = render(<Router history={history}><AuthoritiesContext.Provider value={authorityService}>
            <SearchContext.Provider value={setViewCurateFunction}>
            <TilesView/>
        </SearchContext.Provider></AuthoritiesContext.Provider></Router>);

        // Curate tile not shown initially
        expect(queryByText("icon-curate")).not.toBeInTheDocument();
        expect(queryByText("title-curate")).not.toBeInTheDocument();

        fireEvent.click(getByLabelText("tool-curate"));

        // Curate tile shown with entityTypes after click
        expect(await(waitForElement(() => getByLabelText("icon-curate")))).toBeInTheDocument();
        expect(getByLabelText("title-curate")).toBeInTheDocument();

        // test cannot access Mapping tab
        fireEvent.click(getByText('Customer'));
        expect(queryByText('Mapping')).not.toBeInTheDocument();

        //TODO test that custom tab is available when implemented
    });

    test('Verify Run tile displays from toolbar', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readFlow','writeFlow','runStep']);
        const {getByLabelText, getByText, queryByText, getByTestId} = await render(<Router history={history}>
            <AuthoritiesContext.Provider value={ authorityService}>
                <SearchContext.Provider value={setViewRunFunction}>
                <TilesView/>
            </SearchContext.Provider></AuthoritiesContext.Provider>
            </Router>);

        // Run tile not shown initially
        expect(queryByText("icon-run")).not.toBeInTheDocument();
        expect(queryByText("title-run")).not.toBeInTheDocument();

        fireEvent.click(getByLabelText("tool-run"));

        // Run tile shown with entityTypes after click
        expect(await(waitForElement(() => getByLabelText("icon-run")))).toBeInTheDocument();
        expect(getByLabelText("title-run")).toBeInTheDocument();
        expect(document.querySelector('#flows-container')).toBeInTheDocument();
        expect(getByText('Create Flow')).toBeInTheDocument();
        expect(getByText('testFlow')).toBeInTheDocument();
        // delete should work
        fireEvent.click(getByTestId('deleteFlow-0'));
        // testing that confirmation modal appears
        expect(queryByText('Yes')).toBeInTheDocument();
        fireEvent.click(getByText('No'));

        // test description
        fireEvent.click(getByText('testFlow'));
        expect(getByText('Save')).not.toBeDisabled();
        fireEvent.click(getByText('Cancel'));
        // test run
        fireEvent.click(getByLabelText('icon: right'));
        expect(getByTestId('runStep-1')).toBeInTheDocument();
    });

    test('Verify run tile cannot edit or run with only readFlow authority', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readFlow']);
        const {getByLabelText, getByText, queryByText, getByTestId} = render(<Router history={history}>
            <AuthoritiesContext.Provider value={authorityService}><SearchContext.Provider value={setViewRunFunction}>
                <TilesView/>
            </SearchContext.Provider>
            </AuthoritiesContext.Provider></Router>);

        // Run tile not shown initially
        expect(queryByText("icon-run")).not.toBeInTheDocument();
        expect(queryByText("title-run")).not.toBeInTheDocument();

        fireEvent.click(getByLabelText("tool-run"));

        // Run tile shown with entityTypes after click
        expect(await(waitForElement(() => getByLabelText("icon-run")))).toBeInTheDocument();
        expect(getByLabelText("title-run")).toBeInTheDocument();
        expect(document.querySelector('#flows-container')).toBeInTheDocument();
        expect(getByText('testFlow')).toBeInTheDocument();
        // create flow shouldn't be provided
        expect(queryByText('Create Flow')).toBeDisabled();
        // delete should not work
        fireEvent.click(getByTestId('deleteFlow-0'));
        // testing that confirmation modal didn't appear
        expect(queryByText('Yes')).not.toBeInTheDocument();
        // test description
        fireEvent.click(getByText('testFlow'));
        expect(queryByText('Save')).not.toBeInTheDocument();
        fireEvent.click(getByText('Close'));

        // test run
        fireEvent.click(getByLabelText('icon: right'));
        expect(getByTestId('runStepDisabled-1')).toBeInTheDocument();
        expect(getByTestId('runStepDisabled-2')).toBeInTheDocument();
        expect(getByTestId('runStepDisabled-3')).toBeInTheDocument();
    });

    test('Verify run tile can read/run with readFlow and runStep authority', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readFlow','runStep']);
        const {getByLabelText, getByText, queryByText, getByTestId} = render(<Router history={history}><AuthoritiesContext.Provider value={authorityService}>
            <SearchContext.Provider value={setViewRunFunction}>
                <TilesView/>
            </SearchContext.Provider>
        </AuthoritiesContext.Provider></Router>);


        // Run tile not shown initially
        expect(queryByText("icon-run")).not.toBeInTheDocument();
        expect(queryByText("title-run")).not.toBeInTheDocument();

        fireEvent.click(getByLabelText("tool-run"));

        expect(await(waitForElement(() => getByLabelText("icon-run")))).toBeInTheDocument();
        // test run
        fireEvent.click(getByLabelText('icon: right'));
        expect(getByTestId('runStep-1')).toBeInTheDocument();
        expect(getByTestId('runStep-2')).toBeInTheDocument();
        expect(getByTestId('runStep-3')).toBeInTheDocument();
        expect(getByTestId('runStep-4')).toBeInTheDocument();
        expect(getByTestId('runStep-5')).toBeInTheDocument();
        expect(getByTestId('runStep-6')).toBeInTheDocument();
    });

    test('Verify run tile does not load from toolbar without readFlow authority', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities([]);
        const {getByLabelText, queryByLabelText, queryByText} = render(<Router history={history}><AuthoritiesContext.Provider value={authorityService}>
            <SearchContext.Provider value={setViewRunFunction}>
                <TilesView/>
            </SearchContext.Provider>
        </AuthoritiesContext.Provider></Router>);

        // Curate tile not shown initially
        expect(queryByText("icon-run")).not.toBeInTheDocument();
        expect(queryByText("title-run")).not.toBeInTheDocument();

        await fireEvent.click(getByLabelText("tool-run"));

        // Load tile shown with entityTypes after click
        expect(queryByLabelText("title-run")).not.toBeInTheDocument();
        expect(queryByText('testFlow')).not.toBeInTheDocument();
    });

    test('Verify Load tile displays from toolbar', async () => {
        const {getByLabelText, getByText, queryByText} = render(<Router history={history}><AuthoritiesContext.Provider value={mockDevRolesService}>
            <SearchContext.Provider value={setViewLoadFunction}>
                <TilesView/>
            </SearchContext.Provider>
        </AuthoritiesContext.Provider></Router>);

        // Load tile not shown initially
        expect(queryByText("icon-load")).not.toBeInTheDocument();
        expect(queryByText("title-load")).not.toBeInTheDocument();

        fireEvent.click(getByLabelText("tool-load"));

        // Load tile shown after click
        expect(await(waitForElement(() => getByLabelText("icon-load")))).toBeInTheDocument();
        expect(getByLabelText("title-load")).toBeInTheDocument();
        // Default list view
        expect(getByLabelText("switch-view")).toBeInTheDocument();
        expect(getByLabelText("switch-view-card")).toBeInTheDocument();
        expect(getByLabelText("switch-view-list")).toBeInTheDocument();
        expect(getByLabelText("add-new-list")).toBeInTheDocument();
    });

});


describe('Tiles View component tests for Operator user', () => {

    beforeEach(() => {
        mocks.curateAPI(axiosMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    })

    test('Verify Curate tile', async () => {
        const { getByLabelText, queryByText, getByText } = render(<Router history={history}><AuthoritiesContext.Provider value={testWithOperator}>
            <SearchContext.Provider value={setViewCurateFunction}>
                <TilesView/>
            </SearchContext.Provider>
        </AuthoritiesContext.Provider></Router>);

        // Curate tile not shown initially
        expect(queryByText("icon-curate")).not.toBeInTheDocument();
        expect(queryByText("title-curate")).not.toBeInTheDocument();

        fireEvent.click(getByLabelText("tool-curate"));

        // Curate tile shown with entityTypes after click
        expect(await(waitForElement(() => getByLabelText("icon-curate")))).toBeInTheDocument();
        expect(getByLabelText("title-curate")).toBeInTheDocument();

        fireEvent.click(getByText('Customer'));
        fireEvent.mouseOver(getByText('Mapping1'));

        expect(getByText('Open step details'));
    });
});

