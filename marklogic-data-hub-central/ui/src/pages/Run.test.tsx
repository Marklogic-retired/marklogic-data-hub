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


describe('Verify links back to step details', () => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    test('Verify a user with read authority for steps can use link', async () => {
        mocks.runAPI(axiosMock);
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readFlow','readIngestion', 'readMapping', 'readCustom']);

        let getByText, getByLabelText, getByTestId;
        await act(() => {
            const renderResults =  render(<MemoryRouter>
                <AuthoritiesContext.Provider value={ authorityService}>
                    <Run/>
                </AuthoritiesContext.Provider></MemoryRouter>);
            getByText = renderResults.getByText;
            getByLabelText = renderResults.getByLabelText;
            getByTestId = renderResults.getByTestId
        });
        const existingFlowName = data.flows.data[0].name;
        let steps = data.flows.data[0].steps;
        // Click expand icon
        await act(() => {
            fireEvent.click(getByLabelText("icon: right"));
        });
        const implementedStepTypes = ['ingestion', 'mapping', 'custom'];
        steps.forEach((step) => {
            const viewStepId = `${existingFlowName}-${step.stepNumber}`;
            const stepElement = getByLabelText(`${viewStepId}-content`);
            act(() => {
                fireEvent.mouseOver(stepElement);
            });
            if (implementedStepTypes.includes(step.stepDefinitionType.toLowerCase())) {
                expect(getByTestId(`${viewStepId}-viewStep`)).toBeVisible();
            }
            act(() => {
                fireEvent.mouseLeave(stepElement);
            });
        });
    });

    test('Verify a user with read authority for steps cannot use link', async () => {
        mocks.runAPI(axiosMock);
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readFlow']);
        let getByText, getByLabelText, getByTestId;
        await act(() => {
            const renderResults =  render(<MemoryRouter>
                <AuthoritiesContext.Provider value={ authorityService}>
                    <Run/>
                </AuthoritiesContext.Provider></MemoryRouter>);
            getByText = renderResults.getByText;
            getByLabelText = renderResults.getByLabelText;
            getByTestId = renderResults.getByTestId;
        });

        const existingFlowName = data.flows.data[0].name;
        let steps = data.flows.data[0].steps;
        // Click expand icon
        await act(() => {
            fireEvent.click(getByLabelText("icon: right"));
        });
        const implementedStepTypes = ['ingestion', 'mapping', 'custom'];
        steps.forEach((step) => {
            const viewStepId = `${existingFlowName}-${step.stepNumber}`;
            const stepElement = getByLabelText(`${viewStepId}-content`);
            act(() => {
                fireEvent.mouseOver(stepElement);
            });
            if (implementedStepTypes.includes(step.stepDefinitionType.toLowerCase())) {
                expect(getByTestId(`${viewStepId}-viewStep`)).not.toBeVisible();
            }
            act(() => {
                fireEvent.mouseLeave(stepElement);
            });
        });
    });
});

describe('Verify load step failures in a flow', () => {

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    test('Verify errors when flow with Load step fails with jobStatus finished_with_errors', async() => {
        mocks.runErrorsAPI(axiosMock);
        axiosMock.post['mockImplementationOnce'](jest.fn(() => Promise.resolve(data.response)));
        const { getByText, getByLabelText, getAllByLabelText} = await render(<MemoryRouter><AuthoritiesContext.Provider
          value={mockDevRolesService}><Run/></AuthoritiesContext.Provider></MemoryRouter>);

        // Click disclosure icon
        fireEvent.click(getByLabelText("icon: right"));
        let runButton = await getByLabelText("runStep-failedIngest");
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
        const { getByText, getByLabelText } = await render(<MemoryRouter><AuthoritiesContext.Provider value={ mockDevRolesService}><Run/></AuthoritiesContext.Provider></MemoryRouter>);

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

        fireEvent.click(getByLabelText("runStep-failedIngest"));
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
        const { getByText, getAllByText, getByLabelText, debug } = await render(<MemoryRouter><AuthoritiesContext.Provider value={ mockDevRolesService }><Run/></AuthoritiesContext.Provider></MemoryRouter>);

        let steps = data.flows.data[0].steps;
        let runButton

        // Click disclosure icon
        fireEvent.click(getByLabelText("icon: right"));

        //Run mapping step
        runButton = await getByLabelText(`runStep-${steps[1].stepName}`);
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
        runButton = await getByLabelText(`runStep-${steps[3].stepName}`);
        fireEvent.click(runButton);
        expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Matching step ${steps[3].stepName} ran successfully`)
        })))).toBeInTheDocument();
        fireEvent.click(getByText('Close'));

        //Run merge step
        runButton = await getByLabelText(`runStep-${steps[4].stepName}`);
        fireEvent.click(runButton);
        expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Merging step ${steps[4].stepName} ran successfully`)
        })))).toBeInTheDocument();
        fireEvent.click(getByText('Close'));

        //Run master step
        runButton = await getByLabelText(`runStep-${steps[5].stepName}`);
        fireEvent.click(runButton);
        expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Mastering step ${steps[5].stepName} ran successfully`)
        })))).toBeInTheDocument();
        fireEvent.click(getByText('Close'));

    },10000)

    test('Verify a mapping/match/merge/master step can be run from a flow as data-hub-operator', async () => {
        axiosMock.post['mockImplementation'](jest.fn(() => Promise.resolve(data.jobRespSuccess)));
        const { getByText, getAllByText, getByLabelText } = await render(<MemoryRouter><AuthoritiesContext.Provider value={ mockOpRolesService }><Run/></AuthoritiesContext.Provider></MemoryRouter>);

        let steps = data.flows.data[0].steps;
        let runButton

        // Click disclosure icon
        fireEvent.click(getByLabelText("icon: right"));

        //Run mapping step
        runButton = await getByLabelText(`runStep-${steps[1].stepName}`);
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
        runButton = await getByLabelText(`runStep-${steps[3].stepName}`);
        fireEvent.click(runButton);
        expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Matching step ${steps[3].stepName} ran successfully`)
        })))).toBeInTheDocument();
        fireEvent.click(getByText('Close'));

        //Run merge step
        runButton = await getByLabelText(`runStep-${steps[4].stepName}`);
        fireEvent.click(runButton);
        expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Merging step ${steps[4].stepName} ran successfully`)
        })))).toBeInTheDocument();
        fireEvent.click(getByText('Close'));

        //Run master step
        runButton = await getByLabelText(`runStep-${steps[5].stepName}`);
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
        const { getByText, getByLabelText } = await render(<MemoryRouter><AuthoritiesContext.Provider value={ mockDevRolesService }><Run/></AuthoritiesContext.Provider></MemoryRouter>);

        // Click disclosure icon
        fireEvent.click(getByLabelText("icon: right"));
        expect(await(waitForElement(() => getByText("XML")))).toBeInTheDocument();
        expect(await(waitForElement(() => getByText("loadXML")))).toBeInTheDocument();

        let notification = await(waitForElement(() =>getByLabelText("icon: check-circle")));
        expect(notification).toBeInTheDocument();
        fireEvent.mouseOver(notification);
        expect(await(waitForElement(() => getByText("Step last ran successfully on 7/13/2020, 11:54:06 PM")))).toBeInTheDocument();
    })

    test("Verify a mapping step's notification shows up correctly", async () => {
        mocks.runXMLAPI(axiosMock);
        const { getByText, getByLabelText } = await render(<MemoryRouter><AuthoritiesContext.Provider value={ mockDevRolesService }><Run/></AuthoritiesContext.Provider></MemoryRouter>);

        // Click disclosure icon
        fireEvent.click(getByLabelText("icon: right"));
        expect(await(waitForElement(() => getByText("Mapping1")))).toBeInTheDocument();
        let notification = await(waitForElement(() =>getByLabelText("icon: exclamation-circle")));
        expect(notification).toBeInTheDocument();
        fireEvent.mouseOver(notification);
        expect(await(waitForElement(() => getByText("Step last ran with errors on 4/4/2020, 1:17:45 AM")))).toBeInTheDocument();

        fireEvent.click(notification);
        // New Modal with Error message, uri and details is opened
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Mapping step Mapping1 completed with errors`)
        })))).toBeInTheDocument();
        expect(document.querySelector('#error-list')).toHaveTextContent('Out of 3 batches, 1 succeeded and 2 failed. Error messages are displayed below')
        expect(getByText("Message:")).toBeInTheDocument()
        expect(getByText("Details:")).toBeInTheDocument()
        expect(getByText("URI:")).toBeInTheDocument()
        // Error 2 is present
        //expect(getByText("Error 2")).toBeInTheDocument();
        expect(await(waitForElement(() => getByText("Error 2")))).toBeInTheDocument()
        fireEvent.click(getByText('Close'));
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
        const { getByText, getByPlaceholderText } = await render(<MemoryRouter><AuthoritiesContext.Provider value={ authorityService }><Run/></AuthoritiesContext.Provider></MemoryRouter>);

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
        const { getByText, getByPlaceholderText } = await render(<MemoryRouter><AuthoritiesContext.Provider value={ authorityService }><Run/></AuthoritiesContext.Provider></MemoryRouter>);

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
        const { getByText, getByTestId } = await render(<MemoryRouter><AuthoritiesContext.Provider value={ authorityService }><Run/></AuthoritiesContext.Provider></MemoryRouter>);

        const existingFlowName = data.flows.data[0].name;
        const updateFlowURL = `/api/flows/${existingFlowName}`;

        fireEvent.click(getByTestId(`deleteFlow-${existingFlowName}`));
        fireEvent.click(getByText('Yes'));

        expect(axiosMock.delete).toHaveBeenNthCalledWith(1, updateFlowURL);

    })

    test('Verify a user with readFlow authority only cannot create/update/delete', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readFlow']);
        const { getByPlaceholderText, getByText, getByTestId, queryByText } = await render(<MemoryRouter><AuthoritiesContext.Provider value={ authorityService }><Run/></AuthoritiesContext.Provider></MemoryRouter>);

        const existingFlowName = data.flows.data[0].name;

        expect(getByText(existingFlowName)).toBeInTheDocument();
        // create flow shouldn't be provided
        expect(queryByText('Create Flow')).toBeDisabled();
        // delete should not work
        fireEvent.click(getByTestId(`deleteFlow-${existingFlowName}`));
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
        const { getByText, getByLabelText } = await render(<MemoryRouter><AuthoritiesContext.Provider value={ mockDevRolesService}><Run/></AuthoritiesContext.Provider></MemoryRouter>);

        let steps = data.flows.data[0].steps;

        // Click disclosure icon
        fireEvent.click(getByLabelText("icon: right"));

        //Mapping step failed error
        fireEvent.click(getByLabelText(`runStep-${steps[1].stepName}`));
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Mapping step ${steps[1].stepName} failed`)
        })))).toBeInTheDocument();
        expect(getByText("Message:")).toBeInTheDocument()
        expect(document.querySelector('#error-list')).toHaveTextContent('Local message: failed to apply resource at documents')
        fireEvent.click(getByText('Close'))

        //Matching step failed error
        fireEvent.click(getByLabelText(`runStep-${steps[3].stepName}`));
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Matching step ${steps[3].stepName} failed`)
        })))).toBeInTheDocument();
        expect(getByText("Message:")).toBeInTheDocument()
        expect(document.querySelector('#error-list')).toHaveTextContent('Local message: failed to apply resource at documents')
        fireEvent.click(getByText('Close'))

        //Merging step failed error
        fireEvent.click(getByLabelText(`runStep-${steps[4].stepName}`));
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Merging step ${steps[4].stepName} failed`)
        })))).toBeInTheDocument();
        expect(getByText("Message:")).toBeInTheDocument()
        expect(document.querySelector('#error-list')).toHaveTextContent('Local message: failed to apply resource at documents')
        fireEvent.click(getByText('Close'))

        //Mastering step failed error
        fireEvent.click(getByLabelText(`runStep-${steps[5].stepName}`));
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
        const {getByText, getByLabelText, debug} = await render(<MemoryRouter><AuthoritiesContext.Provider value={ mockDevRolesService}><Run/></AuthoritiesContext.Provider></MemoryRouter>);

        let steps = data.flows.data[0].steps;
        // Click disclosure icon
        fireEvent.click(getByLabelText("icon: right"));

        //Mapping step error
        fireEvent.click(await getByLabelText(`runStep-${steps[1].stepName}`));
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
        fireEvent.click(await getByLabelText(`runStep-${steps[3].stepName}`));
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
        fireEvent.click(await getByLabelText(`runStep-${steps[4].stepName}`));
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
        fireEvent.click(await getByLabelText(`runStep-${steps[5].stepName}`));
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
        fireEvent.click(await getByLabelText(`runStep-${steps[1].stepName}`));

        // New Modal with Error message, uri and details is opened
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,`Mapping step ${steps[1].stepName} completed with errors`)
        })))).toBeInTheDocument();

        let stepType = `${steps[1].stepDefinitionType}`;
        if(stepType === 'mapping'){
            let exploreButton = await(waitForElement(() => getByText("Explore Curated Data")));
            fireEvent.click(exploreButton);
        }
        await wait(() => {
            expect(mockHistoryPush).toHaveBeenCalledWith({"pathname": "/tiles/explore",
                "state": {"entityName": "Customer", "jobId": "350da405-c1e9-4fa7-8269-d9aefe3b4b9a"}});
        })
        //TODO- E2E test to check if the explore tile is loaded or not.*/
    });
});
