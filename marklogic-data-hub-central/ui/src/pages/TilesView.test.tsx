import React from 'react';
import { render, fireEvent, waitForElement, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import TilesView from './TilesView';
import {AuthoritiesContext} from '../util/authorities';
import axiosMock from 'axios';
import curateData from '../config/bench.config';
import authorities from '../config/authorities.config';

jest.mock('axios');

const mockDevRolesService = authorities.DeveloperRolesService;

describe('TilesView component', () => {

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    })
    
    test('Verify TilesView renders with the toolbar', async () => {
        const {getByLabelText} = render(<TilesView/>);

        expect(getByLabelText("toolbar")).toBeInTheDocument();

        expect(getByLabelText("tool-load")).toBeInTheDocument();
        expect(getByLabelText('tool-load')).toHaveStyle('color: rgb(82, 3, 57);')
        expect(getByLabelText("tool-model")).toBeInTheDocument();
        expect(getByLabelText('tool-model')).toHaveStyle('color: rgb(34, 7, 94);')
        expect(getByLabelText("tool-curate")).toBeInTheDocument();
        expect(getByLabelText('tool-curate')).toHaveStyle('color: rgb(255, 197, 61);')
        expect(getByLabelText("tool-run")).toBeInTheDocument();
        expect(getByLabelText('tool-run')).toHaveStyle('color: rgb(6, 17, 120);')
        expect(getByLabelText("tool-explore")).toBeInTheDocument();     
        expect(getByLabelText('tool-explore')).toHaveStyle('color: rgb(0, 71, 79);')   
    });

    test('Verify Curate tile displays from toolbar', async () => {
        const {getByLabelText, getByText, queryByText} = render(<TilesView/>);

        // Curate tile not shown initially
        expect(queryByText("icon-curate")).not.toBeInTheDocument();
        expect(queryByText("title-curate")).not.toBeInTheDocument();

        await axiosMock.get['mockImplementation']((url) => {
            switch (url) {
                case '/api/flows':
                    return Promise.resolve(curateData.flows)
                case '/api/models/primaryEntityTypes':
                    return Promise.resolve(curateData.entityTypes)
                case '/api/artifacts/mapping':
                    return Promise.resolve(curateData.mappings)
                default:
                    return Promise.reject(new Error('not found'))
            }
        }) 
        fireEvent.click(getByLabelText("tool-curate"));
        
        // Curate tile shown with entityTypes after click
        expect(await(waitForElement(() => getByLabelText("icon-curate")))).toBeInTheDocument();
        expect(getByLabelText("title-curate")).toBeInTheDocument();
        expect(getByText('Customer')).toBeInTheDocument();
    });

    test('Verify Run tile displays from toolbar', async () => {
        const {getByLabelText, getByText, queryByText} = await render(<AuthoritiesContext.Provider value={ mockDevRolesService}><TilesView/></AuthoritiesContext.Provider>);

        // Run tile not shown initially
        expect(queryByText("icon-run")).not.toBeInTheDocument();
        expect(queryByText("title-run")).not.toBeInTheDocument();

        await axiosMock.get['mockImplementation']((url) => {
            switch (url) {
                case '/api/flows':
                    return Promise.resolve(curateData.flows)
                case '/api/artifacts/loadData':
                    return Promise.resolve(curateData.loads)
                case '/api/artifacts/mapping':
                    return Promise.resolve(curateData.mappings)
                default:
                    return Promise.reject(new Error('not found'))
            }
        }) 
        fireEvent.click(getByLabelText("tool-run"));
        
        // Run tile shown with entityTypes after click
        expect(await(waitForElement(() => getByLabelText("icon-run")))).toBeInTheDocument();
        expect(getByLabelText("title-run")).toBeInTheDocument();
        expect(document.querySelector('#flows-container')).toBeInTheDocument();
        expect(getByText('Create Flow')).toBeInTheDocument();
        expect(getByText('testFlow')).toBeInTheDocument();
    });

});