import React from 'react';
import {render, cleanup, fireEvent, waitForElement,} from "@testing-library/react";
import SystemInfo from './system-info';
import {AuthoritiesContext, AuthoritiesService} from "../../util/authorities";
import {BrowserRouter as Router} from "react-router-dom";
import data from '../../assets/mock-data/system-info.data';
import axiosMock from "axios";
import mocks from '../../api/__mocks__/mocks.data';

jest.mock('axios');

const getSubElements=(content,node, title)=>{
    const hasText = node => node.textContent === title;
    const nodeHasText = hasText(node);
    const childrenDontHaveText = Array.from(node.children).every(
        child => !hasText(child)
    );
    return nodeHasText && childrenDontHaveText;
};

describe('Update data load settings component', () => {


    beforeEach(() => {
    });

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    test('Verify project info display, user with "Download" and "Clear" button disabled', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['']);
        const { getByText,getByTestId } = render(<Router><AuthoritiesContext.Provider value={authorityService}>
            <SystemInfo {...data.environment}
                        systemInfoVisible={true}
                        setSystemInfoVisible={jest.fn()}
            />
        </AuthoritiesContext.Provider></Router>);
        expect(getByText(data.environment.serviceName)).toBeInTheDocument();
        expect(getByText('Data Hub version:')).toBeInTheDocument();
        expect(getByText(data.environment.dataHubVersion)).toBeInTheDocument();
        expect(getByText('MarkLogic version:')).toBeInTheDocument();
        expect(getByText(data.environment.marklogicVersion)).toBeInTheDocument();
        expect(getByText('Download Configuration Files')).toBeInTheDocument();
        expect(getByTestId('clearData')).toBeInTheDocument();
        expect(getByText('Download a zip file containing flow definitions, step definitions and other user artifacts created or modified by Hub Central.')).toBeInTheDocument();
        expect(getByText('Delete all user data in STAGING, FINAL, and JOBS databases.')).toBeInTheDocument();
        expect(getByText('Download')).toBeDisabled();
        expect(getByText('Clear')).toBeDisabled();
    });

    test('Verify project info display, user with "Download" button enabled', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['downloadProjectFiles']);
        const { getByText } = render(<Router><AuthoritiesContext.Provider value={authorityService}>
            <SystemInfo
                systemInfoVisible={true}
                setSystemInfoVisible={jest.fn()}
            />
        </AuthoritiesContext.Provider></Router>);
        expect(getByText('Download')).toBeEnabled();
        expect(getByText('Clear')).toBeDisabled();
    });

    test('Verify project info display, user with "Clear" button enabled', async () => {
        mocks.clearUserDataAPI(axiosMock);
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['clearUserData']);
        const { getByText, getByLabelText } = render(<Router><AuthoritiesContext.Provider value={authorityService}>
            <SystemInfo
                        systemInfoVisible={true}
                        setSystemInfoVisible={jest.fn()}
            />
        </AuthoritiesContext.Provider></Router>);

        expect(getByText('Download')).toBeDisabled();
        expect(getByText('Clear')).toBeEnabled();

        //Verify confirmation modal appears when Clear button is clicked
        let clearBtn = getByText('Clear');
        fireEvent.click(clearBtn);

        expect(getByText(`Are you sure you want to clear all user data? This action will reset your instance to a state similar to a newly created DHS instance with your project artifacts.`));
        let confirm = getByLabelText('Yes');
        fireEvent.click(confirm);
        expect(axiosMock.post).toBeCalledWith('/api/environment/clearUserData');

        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,"Clear All User Data completed successfully");
        })))).toBeInTheDocument();
    });


});
