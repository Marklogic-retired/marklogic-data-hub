import React from "react";
import {Router} from "react-router";
import {createMemoryHistory} from "history";
const history = createMemoryHistory();
import {render, fireEvent, cleanup} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import {AuthoritiesContext} from "./util/authorities";
import authorities from "./assets/mock-data/authorities.testutils";
import tiles from "./config/tiles.config";
import App from "./App";
import axiosMock from "axios";
import mocks from "./api/__mocks__/mocks.data";
import systemInfoData from "./assets/mock-data/system-info.data";
import UserProvider, {UserContext} from "./util/user-context";
import {userAuthenticated} from "./assets/mock-data/user-context-mock";
import {StompContext} from "./util/stomp";
import {defaultStompContext} from "./assets/mock-data/stomp-mocks";

jest.mock("axios");

const mockDevRolesService = authorities.DeveloperRolesService;

describe("App component", () => {

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test("Verify header title links return to overview", async () => {
    mocks.loadAPI(axiosMock);
    const firstTool = Object.keys(tiles)[0];
    const {getByLabelText, queryByText} = render(<Router history={history}>
      <AuthoritiesContext.Provider value={mockDevRolesService}>
        <UserContext.Provider value={userAuthenticated}><App/></UserContext.Provider>
      </AuthoritiesContext.Provider>
    </Router>);

    // Defaults to overview
    expect(getByLabelText("overview")).toBeInTheDocument();

    // After switching to non-default, click MarkLogic logo to return to overview
    fireEvent.click(getByLabelText("tool-" + firstTool));
    await expect(getByLabelText("icon-" + firstTool)).toBeInTheDocument();
    expect(queryByText("overview")).not.toBeInTheDocument();
    expect(getByLabelText("logo-link").href).toBe("https://www.marklogic.com/");
    fireEvent.mouseDown(getByLabelText("title-link"));
    expect(getByLabelText("overview")).toBeInTheDocument();
  });

  test("Session token stored in local storage", async () => {
    mocks.systemInfoAPI(axiosMock);
    // mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        // have getItem return a value so it appears we just authenticated
        getItem: jest.fn((key) => {
          switch (key) {
          case "dataHubUser":
            return "hub-user";
          case "loginResp":
            return "{\"authorities\":[\"loginToHubCentral\"]}";
          default:
            return null;
          }
        }),
        setItem: jest.fn(() => null)
      },
      writable: true
    });
    // App defaults to pathname "/" which renders Login page. So setting the path to /tiles when App is rendered
    history.push("/tiles");
    const {getByLabelText} = render(<Router history={history}>
      <StompContext.Provider value={defaultStompContext}>
        <AuthoritiesContext.Provider value={mockDevRolesService}>
          <UserProvider><App/></UserProvider>
        </AuthoritiesContext.Provider>
      </StompContext.Provider>
    </Router>);
    // Defaults to overview
    await expect(getByLabelText("overview")).toBeInTheDocument();
    // check localStorage for session token
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "hubCentralSessionToken",
      "mySessionToken"
    );
  });

  test("Pendo token retrieved properly upon login", async () => {
    mocks.systemInfoAPI(axiosMock);
    // mock window object
    Object.defineProperty(window, "pendo", {
      value: {
        // have initialize and identify functions to return a value, so it appears we just authenticated
        initialize: jest.fn(() => null),
        identify: jest.fn(() => null)
      },
      writable: true
    });

    Object.defineProperty(window, "usePendo", {
      value: jest.fn(() => null),
      writable: true
    });
    // App defaults to pathname "/" which renders Login page. So setting the path to /tiles when App is rendered
    history.push("/tiles");
    const {getByLabelText} = render(<Router history={history}>
      <StompContext.Provider value={defaultStompContext}>
        <AuthoritiesContext.Provider value={mockDevRolesService}>
          <UserProvider><App/></UserProvider>
        </AuthoritiesContext.Provider>
      </StompContext.Provider>
    </Router>);
    // Defaults to overview
    await expect(getByLabelText("overview")).toBeInTheDocument();

    // check environment for pendo token upon login
    expect(window.usePendo).toHaveBeenCalledWith(systemInfoData.environment.pendoKey);
    expect(window.pendo.initialize).toHaveBeenCalledWith({
      excludeAllText: true,
      excludeTitle: true
    });
    expect(window.pendo.identify).toHaveBeenCalledTimes(1);
  });
});
