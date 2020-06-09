import React from 'react';
import {render, cleanup, } from "@testing-library/react";
import ProjectPage from './project-page';
import {AuthoritiesContext, AuthoritiesService} from "../../util/authorities";
import {BrowserRouter as Router} from "react-router-dom";

describe('Update data load settings component', () => {

    afterEach(() => {
        cleanup();
    });

    test('verify project info display, user with "Download" button enabled', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['downloadProjectFiles']);
        const { debug,getByText } = render(<Router><AuthoritiesContext.Provider value={authorityService}><ProjectPage  projectPageVisible={true} setProjectPageVisible={jest.fn()}/>
        </AuthoritiesContext.Provider></Router>);
        expect(getByText('Data Hub Version:')).toBeInTheDocument();
        expect(getByText('MarkLogic Version:')).toBeInTheDocument();
        expect(getByText('Download Configuration Files')).toBeInTheDocument();
        expect(getByText('Clear All User Data')).toBeInTheDocument();
        expect(getByText('Download a zip file containing flow definitions, step definitions and other user artifacts created or modified by Hub Central.')).toBeInTheDocument();
        expect(getByText('Delete all user data in STAGING,FINAL and JOBS databases.')).toBeInTheDocument();
        expect(getByText('Download')).toBeEnabled();
    });

    test('should verify project info display, user with "Download" button disabled', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities([]);
        const { getByText } = render(<Router><AuthoritiesContext.Provider value={authorityService}><ProjectPage projectPageVisible={true} setProjectPageVisible={jest.fn()}/>
        </AuthoritiesContext.Provider></Router>);
        expect(getByText('Data Hub Version:')).toBeInTheDocument();
        expect(getByText('MarkLogic Version:')).toBeInTheDocument();
        expect(getByText('Download Configuration Files')).toBeInTheDocument();
        expect(getByText('Clear All User Data')).toBeInTheDocument();
        expect(getByText('Download')).toBeDisabled();
    });

});
