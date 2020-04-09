import React from 'react';
import { render, fireEvent, waitForElement, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import axiosMock from 'axios'
import  Bench from '../pages/Bench';
import {RolesContext} from '../util/roles';
import data from '../config/bench.config';

jest.mock('axios');

afterEach(() => {
    jest.clearAllMocks();
    cleanup();
});

describe('Verify if uri, details in errors are shown', () => {
    test('should render correctly', async() => {
        axiosMock.get.mockImplementation((url) => {
            switch (url) {
                case '/api/flows':
                    return Promise.resolve(data.flows)
                case '/api/artifacts/loadData':
                    return Promise.resolve(data.loads)
                case '/api/jobs/350da405-c1e9-4fa7-8269-d9aefe3b4b9a':
                    return Promise.resolve(data.jobResp)
                default:
                    return Promise.reject(new Error('not found'))
            }
        })
        axiosMock.post.mockImplementationOnce(jest.fn(() => Promise.resolve(data.response)));
        const {getAllByText, getByLabelText } = await render(<RolesContext.Provider value={ data.mockRoleService}><Bench/></RolesContext.Provider>);
        //Click collapse arrow to open flow "testFlow"
        fireEvent.click(getByLabelText("icon: right"));

        //Get the "step start" button for the only step "failedIngest"
        let runButton = await waitForElement(() => getByLabelText("icon: play-circle"));

        //Start the step
        fireEvent.click(runButton);

        //New Modal with Error message, uri and details is opened
        expect(await(waitForElement(() => getAllByText("Message:").length,{"timeout":2500}))).toEqual(1)
        expect(await(waitForElement(() => getAllByText("Details:").length,{"timeout":2500}))).toEqual(1)
        expect(await(waitForElement(() => getAllByText("URI:").length,{"timeout":2500}))).toEqual(1)
        expect(await(waitForElement(() => getAllByText("/test/data/nestedPerson1.json").length,{"timeout":2500}))).toEqual(1)
        expect(await(waitForElement(() => getAllByText("Load \"failedIngest\" completed with errors").length,{"timeout":2500}))).toEqual(1)

        //Error 2 is present
        expect(await(waitForElement(() => getAllByText("Error 2").length,{"timeout":2500}))).toEqual(1)
    });
});
