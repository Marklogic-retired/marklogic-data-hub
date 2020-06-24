import React from 'react';
import {render, cleanup, wait, fireEvent, waitForElement,} from "@testing-library/react";
import SystemInfo from './system-info';
import {AuthoritiesContext, AuthoritiesService} from "../../util/authorities";
import {BrowserRouter as Router} from "react-router-dom";
import data from '../../assets/mock-data/system-info.data';
import axiosMock from "axios";
import LoginForm from "../login-form/login-form";

const getSubElements=(content,node, title)=>{
    const hasText = node => node.textContent === title;
    const nodeHasText = hasText(node);
    const childrenDontHaveText = Array.from(node.children).every(
        child => !hasText(child)
    );
    return nodeHasText && childrenDontHaveText;
}

describe('Update data load settings component', () => {

    afterEach(() => {
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
        const { getByText,getByTestId } = render(<Router><AuthoritiesContext.Provider value={authorityService}>
            <SystemInfo
                systemInfoVisible={true}
                setSystemInfoVisible={jest.fn()}
            />
        </AuthoritiesContext.Provider></Router>);
        expect(getByText('Download')).toBeEnabled();
        expect(getByText('Clear')).toBeDisabled();
    });

    test('Verify project info display, user with "Clear" button enabled', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['clearUserData']);
        const { getByText,getByTestId,container } = render(<Router><AuthoritiesContext.Provider value={authorityService}>
            <SystemInfo
                        systemInfoVisible={true}
                        setSystemInfoVisible={jest.fn()}
            />
        </AuthoritiesContext.Provider></Router>);
        expect(getByText('Download')).toBeDisabled();
        expect(getByText('Clear')).toBeEnabled();
        let clearBtn = getByText('Clear');
        await wait (()=> {
            fireEvent.submit(clearBtn);
        });
        expect(await(waitForElement(() => getByText((content, node) => {
            return getSubElements(content, node,"Clear All User Data completed successfully")
        })))).toBeInTheDocument();
    });


});
