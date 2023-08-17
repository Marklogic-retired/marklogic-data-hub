import React from "react";
import {BrowserRouter as Router} from "react-router-dom";
import {render, wait, waitForElement} from "@testing-library/react";
import axiosInstance from "axios";
import userEvent from "@testing-library/user-event";

import ModalStatus from "./modal-status";
import NoMatchRedirect from "../../pages/noMatchRedirect";
import {UserContext} from "../../util/user-context";
import {
  userSessionWarning,
  userModalError,
  userNoErrorNoSessionWarning,
  userHasModalErrorHasSessionWarning,
} from "../../assets/mock-data/user-context-mock";
import mocks from "../../api/__mocks__/mocks.data";

jest.mock("@config/axios");

const mockHistoryPush = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe("Modal Status Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Modal session status renders and click continue session", async () => {
    axiosInstance.get = jest.fn();
    axiosInstance.get["mockImplementation"](() => Promise.resolve({status: 200}));

    const {getByText} = render(
      <Router>
        <UserContext.Provider value={userSessionWarning}>
          <ModalStatus />
        </UserContext.Provider>
      </Router>,
    );

    await wait(() => {
      expect(getByText("Continue Session")).toBeInTheDocument();
      expect(getByText("Due to Inactivity, you will be logged out in")).toBeInTheDocument();
      userEvent.click(getByText("Continue Session"));
    });
    axiosInstance.get = jest.fn();
    await (() => expect(axiosInstance.get).toHaveBeenCalledTimes(1));
  }, 30000);

  test("Modal session status renders and can click logout", async () => {
    axiosInstance.get = jest.fn();
    axiosInstance.get["mockImplementation"](() => Promise.resolve({status: 200}));

    const {getByText} = render(
      <Router>
        <UserContext.Provider value={userSessionWarning}>
          <ModalStatus />
        </UserContext.Provider>
      </Router>,
    );

    await wait(() => {
      expect(getByText("Continue Session")).toBeInTheDocument();
      expect(getByText("Due to Inactivity, you will be logged out in")).toBeInTheDocument();
      userEvent.click(getByText("Log Out"));
    });
    axiosInstance.get = jest.fn();
    await (() => expect(axiosInstance.get).toHaveBeenCalledTimes(1));
  }, 30000);

  test("Modal can render 500 error and can click OK", async () => {
    axiosInstance.get = jest.fn();
    mocks.systemInfoAPI(axiosInstance);
    const {getByText} = render(
      <Router>
        <UserContext.Provider value={userModalError}>
          <ModalStatus />
        </UserContext.Provider>
      </Router>,
    );

    await waitForElement(() => getByText("500 Internal Server Error"));
    expect(
      getByText("java.net.ConnectException: Failed to connect to localhost/0:0:0:0:0:0:0:1:8011"),
    ).toBeInTheDocument();

    await wait(() => {
      userEvent.click(getByText("OK"));
    });
    expect(userModalError.clearErrorMessage).toBeCalledTimes(1);
  });

  test("Modal can render 500 error and can click Cancel", async () => {
    axiosInstance.get = jest.fn();
    mocks.systemInfoAPI(axiosInstance);
    const {getByText} = render(
      <Router>
        <UserContext.Provider value={userModalError}>
          <ModalStatus />
          <NoMatchRedirect />
        </UserContext.Provider>
      </Router>,
    );

    await waitForElement(() => getByText("500 Internal Server Error"));
    await (() =>
      expect(
        getByText("java.net.ConnectException: Failed to connect to localhost/0:0:0:0:0:0:0:1:8011"),
      ).toBeInTheDocument());

    await wait(() => {
      userEvent.click(getByText("Cancel"));
    });
    await (() => expect(getByText("Operation failed")).toBeInTheDocument());
  });

  test("Modal does not render when no error and no session warning", () => {
    const {queryByText} = render(
      <Router>
        <UserContext.Provider value={userNoErrorNoSessionWarning}>
          <ModalStatus />
        </UserContext.Provider>
      </Router>,
    );

    expect(queryByText("Due to Inactivity, you will be logged out in")).toBeNull();
  });

  test("Error message is rendered over session warning", async () => {
    axiosInstance.get = jest.fn();
    mocks.systemInfoAPI(axiosInstance);
    const {getByText, queryByText} = render(
      <Router>
        <UserContext.Provider value={userHasModalErrorHasSessionWarning}>
          <ModalStatus />
        </UserContext.Provider>
      </Router>,
    );

    await waitForElement(() => getByText("500 Internal Server Error"));
    await (() =>
      expect(
        getByText("java.net.ConnectException: Failed to connect to localhost/0:0:0:0:0:0:0:1:8011"),
      ).toBeInTheDocument());
    await (() => expect(queryByText("Due to Inactivity, you will be logged out in")).toBeNull());
  });

  test("No response (middle tier crash) handled", async () => {
    axiosInstance.get = jest.fn();
    mocks.noResponseAPI(axiosInstance);
    const {getByText} = render(
      <Router>
        <UserContext.Provider value={userHasModalErrorHasSessionWarning}>
          <ModalStatus />
        </UserContext.Provider>
      </Router>,
    );

    await (() => expect(mockHistoryPush.mock.calls.length).toBe(1));
    await (() => expect(mockHistoryPush.mock.calls[0][0]).toBe("/noresponse"));
    await (() => expect(getByText("Session Timeout")).toBeInTheDocument());
  });
});
