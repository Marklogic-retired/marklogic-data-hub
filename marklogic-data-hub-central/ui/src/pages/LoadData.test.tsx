import React from 'react';
import { render, fireEvent, waitForElement, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import axiosMock from 'axios'
import  LoadData from '../pages/LoadData';
import { AuthoritiesContext } from '../util/authorities';
import data from '../config/load.config';
import authorities from '../config/authorities.config';

jest.mock('axios');

const mockDevRolesService = authorities.DeveloperRolesService;
const mockOpRolesService = authorities.OperatorRolesService;

describe('Load page', () => {

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    test('Verify list and card views', async() => {
        axiosMock.get['mockImplementation']((url) => {
            switch (url) {
                case '/api/flows':
                    return Promise.resolve(data.flows)
                case '/api/steps/ingestion':
                    return Promise.resolve(data.loads)
                default:
                    return Promise.reject(new Error('not found'))
            }
        })
        axiosMock.post['mockImplementationOnce'](jest.fn(() => Promise.resolve(data.response)));
        const {getByText, getByLabelText, queryByText } = await render(<AuthoritiesContext.Provider value={ mockDevRolesService}><LoadData/></AuthoritiesContext.Provider>);

        // Default list view
        expect(getByLabelText("switch-view")).toBeInTheDocument();
        expect(getByLabelText("switch-view-card")).toBeInTheDocument();
        expect(getByLabelText("switch-view-list")).toBeInTheDocument();
        expect(getByLabelText("add-new-list")).toBeInTheDocument();
        expect(queryByText("add-new-card")).not.toBeInTheDocument();
        expect(getByText("testLoad")).toBeInTheDocument();

        // Switch to card view
        fireEvent.click(getByLabelText("switch-view-card"));
        expect(getByLabelText("add-new-card")).toBeInTheDocument();
        expect(getByText("testLoad")).toBeInTheDocument();

    });

});
