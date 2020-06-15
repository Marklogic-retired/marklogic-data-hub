import React from 'react';
import {
    render,
    fireEvent,
    waitForElement,
    cleanup,
    wait
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'
import axiosMock from 'axios';
import mocks from '../api/__mocks__/mocks.data';
import  Run from '../pages/Run';
import {AuthoritiesContext, AuthoritiesService} from '../util/authorities';
import data from '../assets/mock-data/flows.data';
import authorities from '../assets/authorities.testutils';
import {RunToolTips} from "../config/tooltips.config";
import {act} from "react-dom/test-utils";
import {MemoryRouter} from "react-router-dom";

jest.mock('axios');
jest.setTimeout(30000);

const mockHistoryPush = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}));


const mockDevRolesService = authorities.DeveloperRolesService;
const mockOpRolesService = authorities.OperatorRolesService;

const getSubElements=(content,node, title)=>{
    const hasText = node => node.textContent === title;
    const nodeHasText = hasText(node);
    const childrenDontHaveText = Array.from(node.children).every(
        child => !hasText(child)
    );
    return nodeHasText && childrenDontHaveText;
}


describe('Verify load step failures in a flow', () => {

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    test('Verify errors when flow with Load step fails with jobStatus finished_with_errors', async() => {
        mocks.runErrorsAPI(axiosMock);
        axiosMock.post['mockImplementationOnce'](jest.fn(() => Promise.resolve(data.response)));
        const { getByText, getByLabelText, getAllByLabelText} = await render(<AuthoritiesContext.Provider
            value={mockDevRolesService}><Run/></AuthoritiesContext.Provider>);

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

        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,"Ingestion step failedIngest completed with errors")
        })))).toBeInTheDocument();
        expect(getByText("Message:")).toBeInTheDocument()
        expect(getByText("Details:")).toBeInTheDocument()
        expect(getByText("URI:")).toBeInTheDocument()
        expect(getByText("/test/data/nestedPerson1.json")).toBeInTheDocument()

        expect(document.querySelector('#error-list')).toHaveTextContent('Out of 3 batches, 1 succeeded and 2 failed. Error messages are displayed below');

        // Error 2 is present
        expect(await(waitForElement(() => getByText("Error 2")))).toBeInTheDocument()

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
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,"Ingestion step failedIngest failed")
        })))).toBeInTheDocument();
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


    test('Verify a mapping/match/merge/master step can be run from a flow as data-hub-developer', async () => {
        axiosMock.post['mockImplementation'](jest.fn(() => Promise.resolve(data.jobRespSuccess)));
        const { getByText, getAllByText, getByLabelText, debug } = await render(<AuthoritiesContext.Provider value={ mockDevRolesService }><Run/></AuthoritiesContext.Provider>);

        let steps = data.flows.data[0].steps;
        let runButton

        // Click disclosure icon
        fireEvent.click(getByLabelText("icon: right"));

        //Run mapping step
        runButton = await getByLabelText(`runStep-${steps[1].stepNumber}`);
        fireEvent.click(runButton);
        expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();

        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Mapping step ${steps[1].stepName} ran successfully`)
        })))).toBeInTheDocument();
        let stepType = `${steps[1].stepDefinitionType}`;
        if(stepType === 'mapping'){
            expect(await(waitForElement(() => getByText("Explore Curated Data")))).toBeInTheDocument();
        }
        else{
            expect(getByText(' ')).toBeInTheDocument();
        }
        fireEvent.click(getByText('Close'));

        //Run match step
        runButton = await getByLabelText(`runStep-${steps[3].stepNumber}`);
        fireEvent.click(runButton);
        expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Matching step ${steps[3].stepName} ran successfully`)
        })))).toBeInTheDocument();
        fireEvent.click(getByText('Close'));

        //Run merge step
        runButton = await getByLabelText(`runStep-${steps[4].stepNumber}`);
        fireEvent.click(runButton);
        expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Merging step ${steps[4].stepName} ran successfully`)
        })))).toBeInTheDocument();
        fireEvent.click(getByText('Close'));

        //Run master step
        runButton = await getByLabelText(`runStep-${steps[5].stepNumber}`);
        fireEvent.click(runButton);
        expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Mastering step ${steps[5].stepName} ran successfully`)
        })))).toBeInTheDocument();
        fireEvent.click(getByText('Close'));

    },10000)

    test('Verify a mapping/match/merge/master step can be run from a flow as data-hub-operator', async () => {
        axiosMock.post['mockImplementation'](jest.fn(() => Promise.resolve(data.jobRespSuccess)));
        const { getByText, getAllByText, getByLabelText } = await render(<AuthoritiesContext.Provider value={ mockOpRolesService }><Run/></AuthoritiesContext.Provider>);

        let steps = data.flows.data[0].steps;
        let runButton

        // Click disclosure icon
        fireEvent.click(getByLabelText("icon: right"));

        //Run mapping step
        runButton = await getByLabelText(`runStep-${steps[1].stepNumber}`);
        fireEvent.click(runButton);
        expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Mapping step ${steps[1].stepName} ran successfully`)
        })))).toBeInTheDocument();
        let stepType = `${steps[1].stepDefinitionType}`;
        if(stepType === 'mapping'){
            expect(await(waitForElement(() => getByText("Explore Curated Data")))).toBeInTheDocument();
        }
        else{
            expect(getByText(' ')).toBeInTheDocument();
        }
        fireEvent.click(getByText('Close'));

        //Run match step
        runButton = await getByLabelText(`runStep-${steps[3].stepNumber}`);
        fireEvent.click(runButton);
        expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Matching step ${steps[3].stepName} ran successfully`)
        })))).toBeInTheDocument();
        fireEvent.click(getByText('Close'));

        //Run merge step
        runButton = await getByLabelText(`runStep-${steps[4].stepNumber}`);
        fireEvent.click(runButton);
        expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Merging step ${steps[4].stepName} ran successfully`)
        })))).toBeInTheDocument();
        fireEvent.click(getByText('Close'));

        //Run master step
        runButton = await getByLabelText(`runStep-${steps[5].stepNumber}`);
        fireEvent.click(runButton);
        expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Mastering step ${steps[5].stepName} ran successfully`)
        })))).toBeInTheDocument();
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

        const existingFlowName = data.flows.data[0].name;
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

        const existingFlowName = data.flows.data[0].name;
        const updateFlowURL = `/api/flows/${existingFlowName}`;

        fireEvent.click(getByTestId('deleteFlow-0'));
        fireEvent.click(getByText('Yes'));

        expect(axiosMock.delete).toHaveBeenNthCalledWith(1, updateFlowURL);

    })

    test('Verify a user with readFlow authority only cannot create/update/delete', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readFlow']);
        const { getByPlaceholderText, getByText, getByTestId, queryByText } = await render(<AuthoritiesContext.Provider value={ authorityService }><Run/></AuthoritiesContext.Provider>);

        const existingFlowName = data.flows.data[0].name;

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

describe('Verify map/match/merge/master step failures in a flow', () => {

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    test('Verify errors when flow with mapping/matching/merging/mastering step fails with jobStatus failed', async() => {
        mocks.runFailedAPI(axiosMock);
        axiosMock.post['mockImplementation'](jest.fn(() => Promise.resolve(data.response)));
        const { getByText, getByLabelText } = await render(<AuthoritiesContext.Provider value={ mockDevRolesService}><Run/></AuthoritiesContext.Provider>);

        let steps = data.flows.data[0].steps;

        // Click disclosure icon
        fireEvent.click(getByLabelText("icon: right"));

        //Mapping step failed error
        fireEvent.click(getByLabelText(`runStep-${steps[1].stepNumber}`));
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Mapping step ${steps[1].stepName} failed`)
        })))).toBeInTheDocument();
        expect(getByText("Message:")).toBeInTheDocument()
        expect(document.querySelector('#error-list')).toHaveTextContent('Local message: failed to apply resource at documents')
        fireEvent.click(getByText('Close'))

        //Matching step failed error
        fireEvent.click(getByLabelText(`runStep-${steps[3].stepNumber}`));
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Matching step ${steps[3].stepName} failed`)
        })))).toBeInTheDocument();
        expect(getByText("Message:")).toBeInTheDocument()
        expect(document.querySelector('#error-list')).toHaveTextContent('Local message: failed to apply resource at documents')
        fireEvent.click(getByText('Close'))

        //Merging step failed error
        fireEvent.click(getByLabelText(`runStep-${steps[4].stepNumber}`));
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Merging step ${steps[4].stepName} failed`)
        })))).toBeInTheDocument();
        expect(getByText("Message:")).toBeInTheDocument()
        expect(document.querySelector('#error-list')).toHaveTextContent('Local message: failed to apply resource at documents')
        fireEvent.click(getByText('Close'))

        //Mastering step failed error
        fireEvent.click(getByLabelText(`runStep-${steps[5].stepNumber}`));
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Mastering step ${steps[5].stepName} failed`)
        })))).toBeInTheDocument();
        expect(getByText("Message:")).toBeInTheDocument()
        expect(document.querySelector('#error-list')).toHaveTextContent('Local message: failed to apply resource at documents')
        fireEvent.click(getByText('Close'))
    })

    test('Verify errors when a flow with mapping/match/merge/mastering step fails with jobStatus finished_with_errors', async () => {
        mocks.runErrorsAPI(axiosMock);
        axiosMock.post['mockImplementation'](jest.fn(() => Promise.resolve(data.response)));
        const {getByText, getByLabelText, debug} = await render(<AuthoritiesContext.Provider value={ mockDevRolesService}><Run/></AuthoritiesContext.Provider>);

        let steps = data.flows.data[0].steps;
        // Click disclosure icon
        fireEvent.click(getByLabelText("icon: right"));

        //Mapping step error
        fireEvent.click(await getByLabelText(`runStep-${steps[1].stepNumber}`));
        // New Modal with Error message, uri and details is opened
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Mapping step ${steps[1].stepName} completed with errors`)
        })))).toBeInTheDocument();
        expect(document.querySelector('#error-list')).toHaveTextContent('Out of 3 batches, 1 succeeded and 2 failed. Error messages are displayed below')
        expect(getByText("Message:")).toBeInTheDocument()
        expect(getByText("Details:")).toBeInTheDocument()
        expect(getByText("URI:")).toBeInTheDocument()
        // Error 2 is present
        //expect(getByText("Error 2")).toBeInTheDocument();
        expect(await(waitForElement(() => getByText("Error 2")))).toBeInTheDocument()
        let stepType = `${steps[1].stepDefinitionType}`;
        if(stepType === 'mapping'){
            expect(await(waitForElement(() => getByText("Explore Curated Data")))).toBeInTheDocument();
        }
        else{
            expect(getByText(' ')).toBeInTheDocument();
        }
        fireEvent.click(getByText('Close'))

        //Matching step error
        fireEvent.click(await getByLabelText(`runStep-${steps[3].stepNumber}`));
        // New Modal with Error message, uri and details is opened
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Matching step ${steps[3].stepName} completed with errors`)
        })))).toBeInTheDocument();
        expect(document.querySelector('#error-list')).toHaveTextContent('Out of 3 batches, 1 succeeded and 2 failed. Error messages are displayed below')
        expect(getByText("Message:")).toBeInTheDocument()
        expect(getByText("Details:")).toBeInTheDocument()
        expect(getByText("URI:")).toBeInTheDocument()
        // Error 2 is present
        expect(getByText("Error 2")).toBeInTheDocument()
        //debug();
        fireEvent.click(getByText('Close'))

        //Merging step error
        fireEvent.click(await getByLabelText(`runStep-${steps[4].stepNumber}`));
        // New Modal with Error message, uri and details is opened
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Merging step ${steps[4].stepName} completed with errors`)
        })))).toBeInTheDocument();
        expect(document.querySelector('#error-list')).toHaveTextContent('Out of 3 batches, 1 succeeded and 2 failed. Error messages are displayed below')
        expect(getByText("Message:")).toBeInTheDocument()
        expect(getByText("Details:")).toBeInTheDocument()
        expect(getByText("URI:")).toBeInTheDocument()
        // Error 2 is present
        expect(getByText("Error 2")).toBeInTheDocument()
        fireEvent.click(getByText('Close'))

        // //Mastering step error
        fireEvent.click(await getByLabelText(`runStep-${steps[5].stepNumber}`));
        // New Modal with Error message, uri and details is opened
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Mastering step ${steps[5].stepName} completed with errors`)
        })))).toBeInTheDocument();
        expect(document.querySelector('#error-list')).toHaveTextContent('Out of 3 batches, 1 succeeded and 2 failed. Error messages are displayed below')
        expect(getByText("Message:")).toBeInTheDocument()
        expect(getByText("Details:")).toBeInTheDocument()
        expect(getByText("URI:")).toBeInTheDocument()
        // Error 2 is present
        expect(getByText("Error 2")).toBeInTheDocument()
        fireEvent.click(getByText('Close'))

    },10000)

    test('Check if explore curated data is clicked and exists in history', async () => {
        mocks.runErrorsAPI(axiosMock);
        axiosMock.post['mockImplementation'](jest.fn(() => Promise.resolve(data.response)));
        let getByText, getByLabelText, getByTestId;
        await act(async() => {
            const renderResults =  render(<MemoryRouter>
                <AuthoritiesContext.Provider value={ mockDevRolesService}>
                    <Run/>
                </AuthoritiesContext.Provider></MemoryRouter>);
            getByText = renderResults.getByText;
            getByLabelText = renderResults.getByLabelText;
            getByTestId = renderResults.getByTestId
        })


        let steps = data.flows.data[0].steps;
        // Click disclosure icon
        fireEvent.click(getByLabelText("icon: right"));
        //Mapping step error
        fireEvent.click(await getByLabelText(`runStep-${steps[1].stepNumber}`));

        // New Modal with Error message, uri and details is opened
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Mapping step ${steps[1].stepName} completed with errors`)
        })))).toBeInTheDocument();

        let stepType = `${steps[1].stepDefinitionType}`;
        if(stepType === 'mapping'){
            let exploreButton = await(waitForElement(() => getByText("Explore Curated Data")));
            fireEvent.click(exploreButton);
        }
        wait(() => {
            expect(mockHistoryPush).toHaveBeenCalledWith('/tiles-explore');
        })
        //TODO- E2E test to check if the explore tile is loaded or not.*/
    });

})

