import React from 'react';
import { Router } from 'react-router';
import { render, fireEvent, wait, cleanup } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import '@testing-library/jest-dom/extend-expect';
import { createMemoryHistory } from 'history';
const history = createMemoryHistory();
import axiosMock from 'axios';
import data from '../../assets/mock-data/curation/flows.data';
import Flows from './flows';
import { SecurityTooltips } from "../../config/tooltips.config";

jest.mock('axios');

describe('Flows component', () => {

    let flowsProps = {
        flows: data.flows.data,
        steps: data.steps.data,
        deleteFlow: () => null,
        createFlow: () => null,
        updateFlow: () => null,
        deleteStep: () => null,
        runStep: () => null,
        running: [],
        uploadError: '',
        newStepToFlowOptions: () => null,
        addStepToFlow: () => null,
        flowsDefaultActiveKey: [],
        showStepRunResponse: () => null,
        runEnded: {},
    };
    const flowName = data.flows.data[0].name;
    const flowStepName = data.flows.data[0].steps[1].stepName;
    const addStepName = data.steps.data['ingestionSteps'][0].name;

    beforeEach(() => {
        axiosMock.get['mockImplementationOnce'](jest.fn(() => Promise.resolve({})));
    });

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    it('Verifies input format names and type circles', () => {
        const allKindsOfIngestInAFlow = [{ name: 'allInputFormats', steps: [{
                "stepDefinitionType": "ingestion",
                "sourceFormat": "csv"
                }, {
                "stepDefinitionType": "ingestion",
                "sourceFormat": "binary"
                }, {
                "stepDefinitionType": "ingestion",
                "sourceFormat": "text"
                }, {
                "stepDefinitionType": "ingestion",
                "sourceFormat": "json"
                }, {
                "stepDefinitionType": "ingestion",
                "sourceFormat": "xml"}
                ]
        }];
        const { getByText, getByLabelText } = render(
            <Router history={history}>
                <Flows {...data.flowProps} flows={allKindsOfIngestInAFlow} />
            </Router>);
        userEvent.click(getByLabelText('icon: right'));
        ["CSV", "BIN", "TXT", "JSON", "XML"].forEach(format => {
            expect(getByText(format)).toBeInTheDocument();
            expect(getByText(format)).toHaveStyle("height: 35px; width: 35px; line-height: 35px; text-align: center;");
        });
    });

    it('user with flow read, write, and operator privileges can view, edit, and run', async () => {
        const {getByText, getByLabelText} = render(
            <Router history={history}><Flows
                {...flowsProps}
                canReadFlow={true}
                canWriteFlow={true}
                hasOperatorRole={true}
            /></Router>
        );

        let flowButton = getByLabelText('icon: right');
        expect(getByText(flowName)).toBeInTheDocument();
        expect(getByLabelText('create-flow')).toBeInTheDocument();
        expect(getByLabelText('deleteFlow-'+flowName)).toBeInTheDocument();

        // check if delete tooltip appears
        fireEvent.mouseOver(getByLabelText('deleteFlow-'+flowName));
        await wait (() => expect(getByText('Delete Flow')).toBeInTheDocument());


        // Open flow
        fireEvent.click(flowButton);
        expect(getByText(flowStepName)).toBeInTheDocument();
        expect(getByLabelText('runStep-'+flowStepName)).toBeInTheDocument();
        expect(getByLabelText('deleteStep-'+flowStepName)).toBeInTheDocument();

        // Open Add Step
        let addStep = getByText('Add Step');
        fireEvent.click(addStep);
        expect(getByText(addStepName)).toBeInTheDocument();

    });

    it('user without flow write privileges cannot edit', async () => {
        const {getByText, getByLabelText, queryByLabelText} = render(
            <Router history={history}><Flows
                {...flowsProps}
                canReadFlow={true}
                canWriteFlow={false}
                hasOperatorRole={true}
            /></Router>
        );

        let flowButton = getByLabelText('icon: right');
        expect(getByText(flowName)).toBeInTheDocument();
        expect(getByLabelText('create-flow-disabled')).toBeInTheDocument();
        expect(getByLabelText('deleteFlowDisabled-'+flowName)).toBeInTheDocument();

        // test delete, create flow, add step buttons display correct tooltip when disabled
        fireEvent.mouseOver(getByLabelText('deleteFlowDisabled-'+flowName));
        await wait (() => expect(getByText('Delete Flow: ' + SecurityTooltips.missingPermission)).toBeInTheDocument());
        fireEvent.mouseOver(getByLabelText('addStepDisabled-0'));
        await wait (() => expect(getByText(SecurityTooltips.missingPermission)).toBeInTheDocument());
        fireEvent.mouseOver(getByLabelText('create-flow-disabled'));
        await wait (() => expect(getByText(SecurityTooltips.missingPermission)).toBeInTheDocument());

        // Open flow
        fireEvent.click(flowButton);
        expect(getByText(flowStepName)).toBeInTheDocument();
        expect(getByLabelText('runStep-'+flowStepName)).toBeInTheDocument(); // Has operator priv's, can still run
        expect(getByLabelText('deleteStepDisabled-'+flowStepName)).toBeInTheDocument();

        // Open Add Step
        let addStep = getByText('Add Step');
        fireEvent.click(addStep);
        expect(queryByLabelText(addStepName)).not.toBeInTheDocument();

    });

    it('user without flow write or operator privileges cannot edit or run', () => {
        const {getByText, getByLabelText, queryByLabelText} = render(
            <Router history={history}><Flows
                {...flowsProps}
                canReadFlow={true}
                canWriteFlow={false}
                hasOperatorRole={false}
            /></Router>
        );

        let flowButton = getByLabelText('icon: right');
        expect(getByText(flowName)).toBeInTheDocument();
        expect(getByLabelText('create-flow-disabled')).toBeInTheDocument();
        expect(getByLabelText('deleteFlowDisabled-'+flowName)).toBeInTheDocument();

        // Open flow
        fireEvent.click(flowButton);
        expect(getByText(flowStepName)).toBeInTheDocument();
        expect(getByLabelText('runStepDisabled-'+flowStepName)).toBeInTheDocument();
        expect(getByLabelText('deleteStepDisabled-'+flowStepName)).toBeInTheDocument();

        // Open Add Step
        let addStep = getByText('Add Step');
        fireEvent.click(addStep);
        expect(queryByLabelText(addStepName)).not.toBeInTheDocument();

    });

    it('user without flow read, write, or operator privileges cannot view, edit, or run', () => {
        const {queryByText, queryByLabelText} = render(
            <Router history={history}><Flows
                {...flowsProps}
                canReadFlow={false}
                canWriteFlow={false}
                hasOperatorRole={false}
            /></Router>
        );

        // Nothing shown, including Create button
        expect(queryByLabelText('("icon: right')).not.toBeInTheDocument();
        expect(queryByText(flowName)).not.toBeInTheDocument();

    });

});
