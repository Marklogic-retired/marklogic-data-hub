import React from 'react';
import {render, cleanup, } from "@testing-library/react";
import SystemInfo from './system-info';
import {AuthoritiesContext, AuthoritiesService} from "../../util/authorities";
import {BrowserRouter as Router} from "react-router-dom";
import data from '../../assets/mock-data/system-info.data';

describe('Update data load settings component', () => {

    afterEach(() => {
        cleanup();
    });

    test('verify project info display, user with "Download" button enabled', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['downloadProjectFiles']);
        const { getByText } = render(<Router><AuthoritiesContext.Provider value={authorityService}>
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
        expect(getByText('Clear All User Data')).toBeInTheDocument();
        expect(getByText('Download a zip file containing flow definitions, step definitions and other user artifacts created or modified by Hub Central.')).toBeInTheDocument();
        expect(getByText('Delete all user data in STAGING, FINAL, and JOBS databases.')).toBeInTheDocument();
        expect(getByText('Download')).toBeEnabled();
    });

    test('should verify project info display, user with "Download" button disabled', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities([]);
        const { getByText } = render(<Router><AuthoritiesContext.Provider value={authorityService}>
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
        expect(getByText('Clear All User Data')).toBeInTheDocument();
        expect(getByText('Download')).toBeDisabled();
    });

});
