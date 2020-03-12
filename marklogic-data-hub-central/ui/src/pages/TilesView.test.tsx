import React from 'react';
import { render, fireEvent, waitForElement, cleanup, getAllByRole } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import TilesView from './TilesView';
import axiosMock from 'axios';
import curateData from '../config/bench.config';

jest.mock('axios');

describe('TilesView component', () => {

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    })
    
    test('Verify TilesView renders with the toolbar', async () => {
        const {getByLabelText, getAllByRole, debug} = render(<TilesView/>);

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

        // Tile not shown initially
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
        
        // Curate Tile shown with entityTypes after click
        expect(await(waitForElement(() => getByLabelText("icon-curate")))).toBeInTheDocument();
        expect(getByLabelText("title-curate")).toBeInTheDocument();
        expect(getByText('Customer')).toBeInTheDocument();
    });

});