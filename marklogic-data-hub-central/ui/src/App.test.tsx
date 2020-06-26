import React from 'react';
import { Router } from 'react-router'
import { createMemoryHistory } from 'history'
const history = createMemoryHistory()
import { render, fireEvent, waitForElement, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { AuthoritiesContext } from './util/authorities';
import authorities from './assets/authorities.testutils';
import tiles from './config/tiles.config';
import App from './App';
import axiosMock from 'axios';
import mocks from './api/__mocks__/mocks.data';
import { UserContext } from './util/user-context';
import { userAuthenticated } from './assets/mock-data/user-context-mock';

jest.mock('axios');

const mockDevRolesService = authorities.DeveloperRolesService;

describe('App component', () => {

  mocks.loadAPI(axiosMock);

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  })

  test('Verify header title links return to overview', async () => {
      const firstTool = Object.keys(tiles)[0];
      // App defaults to pathname "/" which renders Login page. So setting the path to /tiles when App is rendered
      history.push('/tiles');
      const { getByLabelText, queryByText } = render(<Router history = {history}>
          <AuthoritiesContext.Provider value={mockDevRolesService}>
            <UserContext.Provider value={userAuthenticated}><App/></UserContext.Provider>
          </AuthoritiesContext.Provider>
      </Router>);

      // Defaults to overview
      expect(getByLabelText("overview")).toBeInTheDocument();

      // After switching to non-default, click MarkLogic logo to return to overview
      fireEvent.click(getByLabelText("tool-" + firstTool));
      expect(await(waitForElement(() => getByLabelText("icon-" + firstTool)))).toBeInTheDocument();
      expect(queryByText("overview")).not.toBeInTheDocument();
      fireEvent.click(getByLabelText("header-logo"));
      expect(getByLabelText("overview")).toBeInTheDocument();

      // After switching to non-default, click application name to return to overview
      fireEvent.click(getByLabelText("tool-" + firstTool));
      expect(await(waitForElement(() => getByLabelText("icon-" + firstTool)))).toBeInTheDocument();
      expect(queryByText("overview")).not.toBeInTheDocument();
      fireEvent.click(getByLabelText("header-title"));
      expect(getByLabelText("overview")).toBeInTheDocument();

  });

});
