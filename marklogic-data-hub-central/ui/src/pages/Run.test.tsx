import React from 'react';
import { render, fireEvent, waitForElement, waitForElementToBeRemoved, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'
import axiosMock from 'axios';
import mocks from '../config/mocks.config';
import  Run from '../pages/Run';
import {AuthoritiesContext, AuthoritiesService} from '../util/authorities';
import data from '../config/run.config';
import authorities from '../config/authorities.config';
import {RunToolTips} from "../config/tooltips.config";

jest.mock('axios');

const mockDevRolesService = authorities.DeveloperRolesService;
const mockOpRolesService = authorities.OperatorRolesService;

describe('Verify errors associated with running a step', () => {

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    test('Verify errors when flow with Load step fails with jobStatus finished_with_errors', async() => {
        mocks.runErrorsAPI(axiosMock);
        axiosMock.post['mockImplementationOnce'](jest.fn(() => Promise.resolve(data.response)));
        const {getAllByText, getByText, getByLabelText, getAllByLabelText } = await render(<AuthoritiesContext.Provider value={ mockDevRolesService}><Run/></AuthoritiesContext.Provider>);

        // Click disclosure icon
        fireEvent.click(getByLabelText("icon: right"));
        let runButton = await getByLabelText("runStep-1");
        fireEvent.mouseOver(getAllByLabelText("icon: play-circle")[0]);
        await waitForElement(() => getByText(RunToolTips.ingestionStep));

        let upload;
        upload = document.querySelector('#fileUpload');
        const files = [new File(["text1"], "test1.txt", {
            type: "text/plain"
        }),new File(["text2"], "test2.txt", {
            type: "text/plain"
        })];

        Object.defineProperty(upload, "files", {
            value: files
        });
        fireEvent.change(upload);


        fireEvent.click(runButton);

        // New Modal with Error message, uri and details is opened
        expect(await(waitForElement(() => getAllByText("Message:").length,{"timeout":2500}))).toEqual(1)
        expect(await(waitForElement(() => getAllByText("Details:").length,{"timeout":2500}))).toEqual(1)
        expect(await(waitForElement(() => getAllByText("URI:").length,{"timeout":2500}))).toEqual(1)
        expect(await(waitForElement(() => getAllByText("/test/data/nestedPerson1.json").length,{"timeout":2500}))).toEqual(1)
        expect(await(waitForElement(() => getAllByText("Ingestion \"failedIngest\" completed with errors").length,{"timeout":2500}))).toEqual(1)
        expect(document.querySelector('#error-list')).toHaveTextContent('Out of 3 batches, 1 succeeded and 2 failed. Error messages are displayed below')

        // Error 2 is present
        expect(await(waitForElement(() => getAllByText("Error 2").length,{"timeout":2500}))).toEqual(1)

        fireEvent.click(getByText('Close'))
    });

    test('Verify errors when flow with Load step fails with jobStatus failed', async () => {
        mocks.runFailedAPI(axiosMock);
        axiosMock.post['mockImplementationOnce'](jest.fn(() => Promise.resolve(data.response)));
        const { getByText, getByLabelText } = await render(<AuthoritiesContext.Provider value={ mockDevRolesService}><Run/></AuthoritiesContext.Provider>);

        // Click disclosure icon
        fireEvent.click(getByLabelText("icon: right"));

        let upload;
        upload = document.querySelector('#fileUpload');
        const files = [new File(["text1"], "test1.txt", {
            type: "text/plain"
        })];

        Object.defineProperty(upload, "files", {
            value: files
        });
        fireEvent.change(upload);

        fireEvent.click(getByLabelText("runStep-1"));

        expect(await(waitForElement(() => getByText('Ingestion "failedIngest" failed')))).toBeInTheDocument()
        expect(getByText("Message:")).toBeInTheDocument()
        expect(document.querySelector('#error-list')).toHaveTextContent('Local message: failed to apply resource at documents')

        fireEvent.click(getByText('Close'))
    })

});

describe('Verify step running', () => {

    beforeEach(() => {
        mocks.runAPI(axiosMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    test('Verify a mapping step can be run from a flow as data-hub-developer', async () => {
        axiosMock.post['mockImplementationOnce'](jest.fn(() => Promise.resolve(data.responseForMapping)));
        const { getByText, getAllByText, getByLabelText, getAllByLabelText } = await render(<AuthoritiesContext.Provider value={ mockDevRolesService }><Run/></AuthoritiesContext.Provider>);

        // Click disclosure icon
        fireEvent.click(getByLabelText("icon: right"));

        let runButton = await getByLabelText("runStep-1");
        fireEvent.mouseOver(getAllByLabelText("icon: play-circle")[0]);
        await waitForElement(() => getByText(RunToolTips.otherSteps))
        fireEvent.click(runButton);

        expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();
        expect(await(waitForElement(() => getByText('Mapping "Mapping1" ran successfully')))).toBeInTheDocument();

        fireEvent.click(getByText('Close'));

    })

    test('Verify a mapping step can be run from a flow as data-hub-operator', async () => {
        axiosMock.post['mockImplementationOnce'](jest.fn(() => Promise.resolve(data.responseForMapping)));
        const { getByText, getAllByText, getByLabelText } = await render(<AuthoritiesContext.Provider value={ mockOpRolesService }><Run/></AuthoritiesContext.Provider>);

        // Click disclosure icon
        fireEvent.click(getByLabelText("icon: right"));

        let runButton = await getByLabelText("runStep-1");
        fireEvent.click(runButton);

        expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();
        expect(await(waitForElement(() => getByText('Mapping "Mapping1" ran successfully')))).toBeInTheDocument();

        fireEvent.click(getByText('Close'));

    })

});

describe('Verify step display', () => {

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    test('Verify a load step with XML source is displayed correctly', async () => {
        mocks.runXMLAPI(axiosMock);
        const { getByText, getByLabelText } = await render(<AuthoritiesContext.Provider value={ mockDevRolesService }><Run/></AuthoritiesContext.Provider>);

        // Click disclosure icon
        fireEvent.click(getByLabelText("icon: right"));
        expect(await(waitForElement(() => getByText("XML")))).toBeInTheDocument();
        expect(await(waitForElement(() => getByText("loadXML")))).toBeInTheDocument();

    })

});

describe('Verify Run CRUD operations', () => {

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    beforeEach(() => {
       mocks.runCrudAPI(axiosMock);
    });

    test('Verify a user with writeFlow authority can create', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readFlow','writeFlow']);
        const { getByText, getByPlaceholderText } = await render(<AuthoritiesContext.Provider value={ authorityService }><Run/></AuthoritiesContext.Provider>);

        const newFlowValues = { name: 'newFlow', description: 'newFlow description'};
        fireEvent.click(getByText('Create Flow'));
        await(waitForElement(() => getByText('Name:')));
        fireEvent.change(getByPlaceholderText('Enter name'), { target: { value: newFlowValues.name }});
        fireEvent.change(getByPlaceholderText('Enter description'), { target: { value: newFlowValues.description }});
        fireEvent.click(getByText('Save'));

        expect(axiosMock.post).toHaveBeenNthCalledWith(1, '/api/flows', newFlowValues);

    })

    test('Verify a user with writeFlow authority can update', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readFlow','writeFlow']);
        const { getByText, getByPlaceholderText } = await render(<AuthoritiesContext.Provider value={ authorityService }><Run/></AuthoritiesContext.Provider>);

        const existingFlowName = data.flowsWithMapping.data[0].name;
        const updateFlowURL = `/api/flows/${existingFlowName}`;

        const updatedFlow = { name: existingFlowName, description: `updated ${existingFlowName} description`};
        fireEvent.click(getByText(existingFlowName));
        await(waitForElement(() => getByText("Name:")));
        expect(getByPlaceholderText('Enter name')).toBeDisabled();
        fireEvent.change(getByPlaceholderText('Enter description'), { target: { value: updatedFlow.description }});
        fireEvent.click(getByText('Save'));

        expect(axiosMock.put).toHaveBeenNthCalledWith(1, updateFlowURL, updatedFlow);
    })

    test('Verify a user with writeFlow authority can delete', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readFlow','writeFlow']);
        const { getByText, getByTestId } = await render(<AuthoritiesContext.Provider value={ authorityService }><Run/></AuthoritiesContext.Provider>);

        const existingFlowName = data.flowsWithMapping.data[0].name;
        const updateFlowURL = `/api/flows/${existingFlowName}`;

        fireEvent.click(getByTestId('deleteFlow-0'));
        fireEvent.click(getByText('Yes'));

        expect(axiosMock.delete).toHaveBeenNthCalledWith(1, updateFlowURL);

    })

    test('Verify a user with readFlow authority only cannot create/update/delete', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readFlow']);
        const { getByPlaceholderText, getByText, getByTestId, queryByText } = await render(<AuthoritiesContext.Provider value={ authorityService }><Run/></AuthoritiesContext.Provider>);

        const existingFlowName = data.flowsWithMapping.data[0].name;

        expect(getByText(existingFlowName)).toBeInTheDocument();
        // create flow shouldn't be provided
        expect(queryByText('Create Flow')).toBeDisabled();
        // delete should not work
        fireEvent.click(getByTestId('deleteFlow-0'));
        // testing that confirmation modal didn't appear
        expect(queryByText('Yes')).not.toBeInTheDocument();
        // test description
        fireEvent.click(getByText(existingFlowName));
        expect(getByPlaceholderText('Enter name')).toBeDisabled();
        expect(getByPlaceholderText('Enter description')).toBeDisabled();
        expect(queryByText('Save')).not.toBeInTheDocument();
        fireEvent.click(getByText('Close'));

    })
});