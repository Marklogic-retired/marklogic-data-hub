import React from 'react';
import { render, fireEvent, waitForElement, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import axiosMock from 'axios'
import  Bench from '../pages/Bench';
import {AuthoritiesContext} from '../util/authorities';
import data from '../config/bench.config';
import authorities from '../config/authorities.config';

jest.mock('axios');

const mockDevRolesService = authorities.DeveloperRolesService;
const mockOpRolesService = authorities.OperatorRolesService;

describe('Verify errors associated with running a step', () => {

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    test('Verify errors when flow with Load step fails with jobStatus finished_with_errors', async() => {
        axiosMock.get['mockImplementation']((url) => {
            switch (url) {
                case '/api/flows':
                    return Promise.resolve(data.flows)
                case '/api/steps/ingestion':
                    return Promise.resolve(data.loads)
                case '/api/steps/mapping':
                    return Promise.resolve(data.mappings)
                case '/api/jobs/350da405-c1e9-4fa7-8269-d9aefe3b4b9a':
                    return Promise.resolve(data.jobRespFailedWithError)
                default:
                    return Promise.reject(new Error('not found'))
            }
        })
        axiosMock.post['mockImplementationOnce'](jest.fn(() => Promise.resolve(data.response)));
        const {getAllByText, getByText, getByLabelText } = await render(<AuthoritiesContext.Provider value={ mockDevRolesService}><Bench/></AuthoritiesContext.Provider>);

        // Click disclosure icon
        fireEvent.click(getByLabelText("icon: right"));

        let runButton = await getByLabelText("runStep-1");
        fireEvent.click(runButton);

        // New Modal with Error message, uri and details is opened
        expect(await(waitForElement(() => getAllByText("Message:").length,{"timeout":2500}))).toEqual(1)
        expect(await(waitForElement(() => getAllByText("Details:").length,{"timeout":2500}))).toEqual(1)
        expect(await(waitForElement(() => getAllByText("URI:").length,{"timeout":2500}))).toEqual(1)
        expect(await(waitForElement(() => getAllByText("/test/data/nestedPerson1.json").length,{"timeout":2500}))).toEqual(1)
        expect(await(waitForElement(() => getAllByText("Load \"failedIngest\" completed with errors").length,{"timeout":2500}))).toEqual(1)
        expect(document.querySelector('#error-list')).toHaveTextContent('Out of 3 batches, 1 succeeded and 2 failed. Error messages are displayed below')

        // Error 2 is present
        expect(await(waitForElement(() => getAllByText("Error 2").length,{"timeout":2500}))).toEqual(1)

        fireEvent.click(getByText('Close'))
    });

    test('Verify errors when flow with Load step fails with jobStatus failed', async () => {
        axiosMock.get['mockImplementation']((url) => {
            switch (url) {
                case '/api/flows':
                    return Promise.resolve(data.flows)
                case '/api/steps/ingestion':
                    return Promise.resolve(data.loads)
                case '/api/steps/mapping':
                    return Promise.resolve(data.mappings)
                case '/api/jobs/350da405-c1e9-4fa7-8269-d9aefe3b4b9a':
                    return Promise.resolve(data.jobRespFailed)
                default:
                    return Promise.reject(new Error('not found'))
            }
        })
        axiosMock.post['mockImplementationOnce'](jest.fn(() => Promise.resolve(data.response)));
        const { getByText, getByLabelText } = await render(<AuthoritiesContext.Provider value={ mockDevRolesService}><Bench/></AuthoritiesContext.Provider>);

        // Click disclosure icon
        fireEvent.click(getByLabelText("icon: right"));

        let runButton = await getByLabelText("runStep-1");
        fireEvent.click(runButton);

        expect(await(waitForElement(() => getByText("Running...")))).toBeInTheDocument();
        expect(await(waitForElement(() => getByText('Load "failedIngest" failed')))).toBeInTheDocument()
        expect(getByText("Message:")).toBeInTheDocument()
        expect(document.querySelector('#error-list')).toHaveTextContent('Local message: failed to apply resource at documents')

        fireEvent.click(getByText('Close'))
    })

});

describe('Verify step running', () => {

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    test('Verify a mapping step can be run from a flow as data-hub-developer', async () => {
        axiosMock.get['mockImplementation']((url) => {
            switch (url) {
                case '/api/flows':
                    return Promise.resolve(data.flowsWithMapping)
                case '/api/steps/ingestion':
                    return Promise.resolve(data.loads)
                case '/api/steps/mapping':
                    return Promise.resolve(data.mappings)
                case '/api/jobs/e4590649-8c4b-419c-b6a1-473069186592':
                    return Promise.resolve(data.jobRespSuccess)
                default:
                    return Promise.reject(new Error('not found'))
            }
        })
        axiosMock.post['mockImplementationOnce'](jest.fn(() => Promise.resolve(data.responseForMapping)));
        const { getByText, getByLabelText } = await render(<AuthoritiesContext.Provider value={ mockDevRolesService }><Bench/></AuthoritiesContext.Provider>);

        // Click disclosure icon
        fireEvent.click(getByLabelText("icon: right"));

        let runButton = await getByLabelText("runStep-1");
        fireEvent.click(runButton);

        expect(await(waitForElement(() => getByText("Running...")))).toBeInTheDocument();
        expect(await(waitForElement(() => getByText('Map "Mapping1" ran successfully')))).toBeInTheDocument();

        fireEvent.click(getByText('Close'));

    })

    test('Verify a mapping step can be run from a flow as data-hub-operator', async () => {
        axiosMock.get['mockImplementation']((url) => {
            switch (url) {
                case '/api/flows':
                    return Promise.resolve(data.flowsWithMapping)
                case '/api/steps/ingestion':
                    return Promise.resolve(data.loads)
                case '/api/steps/mapping':
                    return Promise.resolve(data.mappings)
                case '/api/jobs/e4590649-8c4b-419c-b6a1-473069186592':
                    return Promise.resolve(data.jobRespSuccess)
                default:
                    return Promise.reject(new Error('not found'))
            }
        })
        axiosMock.post['mockImplementationOnce'](jest.fn(() => Promise.resolve(data.responseForMapping)));
        const { getByText, getByLabelText } = await render(<AuthoritiesContext.Provider value={ mockOpRolesService }><Bench/></AuthoritiesContext.Provider>);

        // Click disclosure icon
        fireEvent.click(getByLabelText("icon: right"));

        let runButton = await getByLabelText("runStep-1");
        fireEvent.click(runButton);

        expect(await(waitForElement(() => getByText("Running...")))).toBeInTheDocument();
        expect(await(waitForElement(() => getByText('Map "Mapping1" ran successfully')))).toBeInTheDocument();

        fireEvent.click(getByText('Close'));

    })

});

describe('Verify step display', () => {

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    test('Verify a load step with XML source is displayed correctly', async () => {
        axiosMock.get['mockImplementation']((url) => {
            switch (url) {
                case '/api/flows':
                    return Promise.resolve(data.flowsXML)
                case '/api/steps/ingestion':
                    return Promise.resolve(data.loadsXML)
                case '/api/steps/mapping':
                    return Promise.resolve(data.mappings)
                default:
                    return Promise.reject(new Error('not found'))
            }
        })
        const { getByText, getByLabelText } = await render(<AuthoritiesContext.Provider value={ mockDevRolesService }><Bench/></AuthoritiesContext.Provider>);

        // Click disclosure icon
        fireEvent.click(getByLabelText("icon: right"));
        expect(await(waitForElement(() => getByText("XML")))).toBeInTheDocument();
        expect(await(waitForElement(() => getByText("loadXML")))).toBeInTheDocument();

    })

});
