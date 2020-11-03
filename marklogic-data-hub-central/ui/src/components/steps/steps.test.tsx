import React from 'react';
import { fireEvent, render, wait, cleanup } from "@testing-library/react";
import Steps from './steps';
import axiosMock from 'axios';
import mocks from '../../api/__mocks__/mocks.data';
import data from '../../assets/mock-data/curation/advanced-settings.data';
import {AdvancedSettingsMessages} from "../../config/messages.config";

jest.mock('axios');

describe("Steps settings component", () => {

    beforeEach(() => {
        mocks.advancedAPI(axiosMock);
      });

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    const stepLoad = data.stepLoad.data;
    const stepMapping = data.stepMapping.data;
    const stepMatching = data.stepMatching.data;
    //const stepMerging = data.stepMerging.data;
    const stepCustom = {...data.stepLoad.data, stepDefinitionName:'custom-ingestion', name: 'CustomLoad'};

    const stepsProps = {
        isNewStep: false,
        createStep: jest.fn(),
        updateStep: jest.fn(),
        stepData: {},
        sourceDatabase: '',
        canReadWrite: true,
        canReadOnly: true,
        tooltipsData: {},
        openStepSettings: true,
        setOpenStepSettings: jest.fn(),
        activityType: '',
        canWrite: true
    }

    test('Verify rendering of Load step, tab switching, save changes confirmation on tab change', async () => {
        const { baseElement, getByText, getByLabelText, getByPlaceholderText } = render(
            <Steps {...stepsProps} activityType='ingestion' stepData={stepLoad} />
        );

        expect(getByText('Loading Step Settings')).toBeInTheDocument();
        expect(getByLabelText('Close')).toBeInTheDocument();

        // Default Basic tab
        expect(getByText('Basic')).toHaveClass('ant-tabs-tab-active');
        expect(getByText('Advanced')).not.toHaveClass('ant-tabs-tab-active');
        expect(baseElement.querySelector('#name')).toHaveValue('AdvancedLoad');
        // Other Basic settings details tested in create-edit-*.test.tsx

        // Switch to Advanced tab
        await wait(() => {
            fireEvent.click(getByText('Advanced'));
        });
        expect(getByText('Basic')).not.toHaveClass('ant-tabs-tab-active');
        expect(getByText('Advanced')).toHaveClass('ant-tabs-tab-active');
        expect(getByPlaceholderText('Please enter target permissions')).toHaveValue('data-hub-common,read,data-hub-common,update');
        // Other Advanced settings details tested in advanced-settings.test.tsx

        // Change form content, switch tabs, verify save confirm dialog
        fireEvent.change(getByPlaceholderText('Please enter target permissions'), { target: { value: 'data-hub-common,read' }});
        expect(getByPlaceholderText('Please enter target permissions')).toHaveValue('data-hub-common,read');
        fireEvent.blur(getByPlaceholderText('Please enter target permissions'));

        fireEvent.click(getByText('Basic'));
        expect(getByText('Save changes?')).toBeInTheDocument();
        expect(getByText('Yes')).toBeInTheDocument();
        expect(getByText('No')).toBeInTheDocument();
    
        const noButton = getByText('No');
        noButton.onclick = jest.fn();
        fireEvent.click(noButton);
        expect(noButton.onclick).toHaveBeenCalledTimes(1);
    
        const yesButton = getByText('Yes');
        yesButton.onclick = jest.fn();
        fireEvent.click(yesButton);
        expect(yesButton.onclick).toHaveBeenCalledTimes(1);

    });

    test.only('Verify rendering of Mapping step, tab disabling on form error, discard changes dialog on close', async () => {
        const { getByText, getByLabelText, getByPlaceholderText, getByTestId } = render(
            <Steps {...stepsProps} activityType='mapping' stepData={stepMapping} />
        );

        expect(getByText('Mapping Step Settings')).toBeInTheDocument();
        expect(getByLabelText('Close')).toBeInTheDocument();

        // Default Basic tab
        expect(getByText('Basic')).toHaveClass('ant-tabs-tab-active');
        expect(getByText('Advanced')).not.toHaveClass('ant-tabs-tab-active');

        // Switch to Advanced tab, create error, verify other tab disabled
        await wait(() => {
            fireEvent.click(getByText('Advanced'));
        });
        expect(getByPlaceholderText('Please enter target permissions')).toHaveValue('data-hub-common,read,data-hub-common,update');
        fireEvent.change(getByPlaceholderText('Please enter target permissions'), { target: { value: 'bad-value' }});
        expect(getByPlaceholderText('Please enter target permissions')).toHaveValue('bad-value');
        fireEvent.blur(getByPlaceholderText('Please enter target permissions'));
        expect(getByTestId('validationError')).toHaveTextContent(AdvancedSettingsMessages.targetPermissions.incorrectFormat);

        expect(getByText('Basic')).toHaveClass('ant-tabs-tab-disabled');

        // Fix error, verify other tab enabled
        fireEvent.change(getByPlaceholderText('Please enter target permissions'), { target: { value: 'data-hub-common,read' }});
        expect(getByPlaceholderText('Please enter target permissions')).toHaveValue('data-hub-common,read');
        fireEvent.blur(getByPlaceholderText('Please enter target permissions'));
        expect(getByTestId('validationError')).toHaveTextContent('');

        expect(getByText('Basic')).not.toHaveClass('ant-tabs-tab-disabled');

        // Close dialog, verify discard changes confirm dialog
        await wait(() => {
            fireEvent.click(getByLabelText('Close'));
        });

        expect(getByText('Discard changes?')).toBeInTheDocument();
        expect(getByText('Yes')).toBeInTheDocument();
        expect(getByText('No')).toBeInTheDocument();

        const noButton = getByText('No');
        noButton.onclick = jest.fn();
        fireEvent.click(noButton);
        expect(noButton.onclick).toHaveBeenCalledTimes(1);
    
        const yesButton = getByText('Yes');
        yesButton.onclick = jest.fn();
        fireEvent.click(yesButton);
        expect(yesButton.onclick).toHaveBeenCalledTimes(1);

    });

    test('Verify rendering of Matching step', async () => {
        const { getByText, getByLabelText } = render(
            <Steps {...stepsProps} activityType='matching' stepData={stepMatching} />
        );

        expect(getByText('Matching Step Settings')).toBeInTheDocument();
        expect(getByLabelText('Close')).toBeInTheDocument();
    });

    // TODO add test for merging
    // test('Verify rendering of Merging step', async () => {
    //     const { getByText, getByLabelText } = render(
    //         <Steps {...stepsProps} activityType='merging' stepData={stepMerging} />
    //     );

    //     expect(getByText('Merging Step Settings')).toBeInTheDocument();
    //     expect(getByLabelText('Close')).toBeInTheDocument();
    // });

    test('Verify rendering of Custom step', async () => {
        const { getByText, getByLabelText } = render(
            <Steps {...stepsProps} activityType='custom' stepData={stepCustom} />
        );

        expect(getByText('Custom Step Settings')).toBeInTheDocument();
        expect(getByLabelText('Close')).toBeInTheDocument();
    });

});
