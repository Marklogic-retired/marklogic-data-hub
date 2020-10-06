import React from 'react';
import {fireEvent, render} from "@testing-library/react";
import { createMemoryHistory } from 'history';
const history = createMemoryHistory();
import NoMatchRedirect from './noMatchRedirect';
import {Router} from "react-router";
import {AuthoritiesContext} from "../util/authorities";
import { userAuthenticated } from '../assets/mock-data/user-context-mock';
import authorities from "../assets/mock-data/authorities.testutils";
import {UserContext} from "../util/user-context";

const testAsDeveloper = authorities.DeveloperRolesService;

describe('noMatchRedirect component test', () => {

    test('Verify error page redirects correctly when "Back Home" is clicked', async () => {

        const { getByText, getByLabelText, rerender } = render(<Router history={history}><NoMatchRedirect /></Router>);

        expect(getByText('404')).toBeInTheDocument();
        expect(getByText('Sorry, the page you visited does not exist.')).toBeInTheDocument();

        //Should redirect to / when not authenticated
        fireEvent.click(getByLabelText('back home'));
        expect(history.location.pathname.endsWith('/')).toBeTruthy();

        //Should redirect to /tiles when authenticated
        rerender(<Router history={history}>
            <AuthoritiesContext.Provider value={testAsDeveloper}>
                <UserContext.Provider value={userAuthenticated}><NoMatchRedirect /></UserContext.Provider>
            </AuthoritiesContext.Provider>
        </Router>);
        fireEvent.click(getByLabelText('back home'));
        expect(history.location.pathname.endsWith('/tiles')).toBeTruthy();
    });

});
