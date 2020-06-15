import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, wait } from '@testing-library/react';
import axiosMock from 'axios'
import userEvent from "@testing-library/user-event";

import ModalStatus from './modal-status';
import NoMatchRedirect from '../../pages/noMatchRedirect';
import { UserContext } from '../../util/user-context';
import {
  userSessionWarning,
  userModalError,
  userNoErrorNoSessionWarning,
  userHasModalErrorHasSessionWarning
} from '../../assets/mock-data/user-context-mock';

jest.mock('axios');

describe('Modal Status Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Modal session status renders and click continue session', async () => {
    axiosMock.get['mockImplementation'](() => Promise.resolve({ status: 200 }));

    const { getByText } = render(
      <Router>
        <UserContext.Provider value={userSessionWarning}>
          <ModalStatus/>
        </UserContext.Provider>
      </Router>);

      await wait(() => {
        expect(getByText('Continue Session')).toBeInTheDocument()
        expect(getByText('Due to Inactivity, you will be logged out in')).toBeInTheDocument();
        userEvent.click(getByText('Continue Session'));
      });
      expect(axiosMock.get).toHaveBeenCalledTimes(1);
  });

  test('Modal session status renders and can click logout', async () => {
    axiosMock.get['mockImplementation'](() => Promise.resolve({ status: 200 }));

    const { getByText } = render(
      <Router>
        <UserContext.Provider value={userSessionWarning}>
          <ModalStatus/>
        </UserContext.Provider>
      </Router>);

      await wait(() => {
        expect(getByText('Continue Session')).toBeInTheDocument()
        expect(getByText('Due to Inactivity, you will be logged out in')).toBeInTheDocument();
        userEvent.click(getByText('Log Out'));
      });
      expect(axiosMock.get).toHaveBeenCalledTimes(1);
  });

  test('Modal can render 500 error and can click OK', async () => {
    const { getByText } = render(
      <Router>
        <UserContext.Provider value={userModalError}>
          <ModalStatus/>
        </UserContext.Provider>
      </Router>);

      expect(getByText('500 Internal Server Error')).toBeInTheDocument();
      expect(getByText('java.net.ConnectException: Failed to connect to localhost/0:0:0:0:0:0:0:1:8011')).toBeInTheDocument();

      await wait(() => {
        userEvent.click(getByText('OK'));
      });
      expect(userModalError.clearErrorMessage).toBeCalledTimes(1);
  });

  test('Modal can render 500 error and can click Cancel', async () => {
    const { getByText } = render(
      <Router>
        <UserContext.Provider value={userModalError}>
          <ModalStatus/>
          <NoMatchRedirect/>
        </UserContext.Provider>
      </Router>);

      expect(getByText('500 Internal Server Error')).toBeInTheDocument();
      expect(getByText('java.net.ConnectException: Failed to connect to localhost/0:0:0:0:0:0:0:1:8011')).toBeInTheDocument();

      await wait(() => {
        userEvent.click(getByText('Cancel'));
      });

      expect(getByText('Sorry, the page you visited does not exist.')).toBeInTheDocument();

  });

  test('Modal does not render when no error and no session warning', () => {
    const { queryByText } = render(
      <Router>
        <UserContext.Provider value={userNoErrorNoSessionWarning}>
          <ModalStatus/>
        </UserContext.Provider>
      </Router>);

      expect(queryByText('Due to Inactivity, you will be logged out in')).toBeNull();
  });

  test('Error message is rendered over session warning', async () => {
    const { getByText, queryByText } = render(
      <Router>
        <UserContext.Provider value={userHasModalErrorHasSessionWarning}>
          <ModalStatus/>
        </UserContext.Provider>
      </Router>);

    expect(getByText('500 Internal Server Error')).toBeInTheDocument();
    expect(getByText('java.net.ConnectException: Failed to connect to localhost/0:0:0:0:0:0:0:1:8011')).toBeInTheDocument();
    expect(queryByText('Due to Inactivity, you will be logged out in')).toBeNull();
  });
});


