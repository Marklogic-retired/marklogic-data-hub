import React from "react";
import {render, cleanup, waitForElement, getByTestId} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {BrowserRouter as Router} from "react-router-dom";
import {UserContext} from "../../util/user-context";
import Header from "./header";
import data from "../../assets/mock-data/system-info.data";
import {userAuthenticated} from "../../assets/mock-data/user-context-mock";
import {Application} from "../../config/application.config";
import {fireEvent} from "@testing-library/dom";


describe("Header component", () => {

  afterEach(cleanup);

  test.only("should render correctly when a user is not logged in", () => {

    const {getByText, getByLabelText, queryByText} = render(
      <Router>
        <Header environment={data.environment}/>
      </Router>
    );

    expect(getByLabelText("header-logo")).toBeInTheDocument();
    expect(getByText(Application.title)).toBeInTheDocument();
    expect(getByLabelText("icon: question-circle")).toBeInTheDocument();
    expect(queryByText("icon: user")).not.toBeInTheDocument();
    //unauthenticated users get sent to default Marklogic docs
    expect(document.querySelector("#help-link")).toHaveAttribute("href", "https://docs.marklogic.com/datahub/");
  });

  test("should render correctly when a user is logged in", async () => {

    const {getByText, getByLabelText, rerender} = render(
      <Router>
        <UserContext.Provider value={userAuthenticated}>
          <Header environment = {{...data.environment, dataHubVersion: "5.3-SNAPSHOT"}}/>
        </UserContext.Provider>
      </Router>
    );
    expect(getByText(Application.title)).toBeInTheDocument();
    expect(getByLabelText("header-logo")).toBeInTheDocument();
    // expect(getByLabelText('icon: search')).toBeInTheDocument();
    // expect(getByLabelText('icon: question-circle')).toBeInTheDocument();
    // expect(getByLabelText('icon: user')).toBeInTheDocument();
    // expect(getByLabelText('icon: setting')).toBeInTheDocument();

    //verify icons and respective tooltips
    fireEvent.mouseOver(getByLabelText("icon: user"));
    await waitForElement(() => getByText("User"));

    fireEvent.mouseOver(getByLabelText("icon: question-circle"));
    await waitForElement(() => getByText("Help"));

    fireEvent.mouseOver(getByLabelText("icon: info-circle"));
    await waitForElement(() => getByLabelText("info-text"));

    //verify correct version specific link when environment hub version data is set to '5.3-SNAPSHOT'
    expect(document.querySelector("#help-link")).toHaveAttribute("href", "https://docs.marklogic.com/datahub/5.3");

    //verify correct version specific link given specific dataHub release version
    rerender(
      <Router>
        <UserContext.Provider value={userAuthenticated}>
          <Header environment = {{...data.environment, dataHubVersion: "5.2.1"}}/>
        </UserContext.Provider>
      </Router>
    );
    expect(document.querySelector("#help-link")).toHaveAttribute("href", "https://docs.marklogic.com/datahub/5.2");

    //verify correct version specific link given multi-digit dataHub versions
    rerender(
      <Router>
        <UserContext.Provider value={userAuthenticated}>
          <Header environment = {{...data.environment, dataHubVersion: "5.64.123456"}}/>
        </UserContext.Provider>
      </Router>
    );
    expect(document.querySelector("#help-link")).toHaveAttribute("href", "https://docs.marklogic.com/datahub/5.64");

  });

  test("verify tabbing and arrow key controls", async () => {
    let i: number;

    const {getByLabelText} = render(
      <Router>
        <UserContext.Provider value={userAuthenticated}>
          <Header environment = {{...data.environment, dataHubVersion: "5.3-SNAPSHOT"}}/>
        </UserContext.Provider>
      </Router>
    );

    const element_logo = getByLabelText("logo-link");
    const element_title = getByLabelText("title-link");
    const element_service = getByLabelText("service-details");
    const element_help = getByLabelText("help-link");
    const element_user = getByTestId("user-dropdown");

    const header = [element_logo, element_title, element_service, element_help, element_user];

    // verify element exists and can be focused
    header.forEach((element, i) => {
      expect(element).toBeInTheDocument();
      element.focus();
      expect(element).toHaveFocus();
    });

    element_logo.focus();

    // verify elements tab in given order
    for (i = 1; i < 5; ++i) {
      userEvent.tab();
      expect(header[i]).toHaveFocus();
    }

    // verify elements tab backwards in same order
    for (i = 3; i >= 0; --i) {
      userEvent.tab({shift: true});
      expect(header[i]).toHaveFocus();
    }

    // verify right arrow key progresses focus in given order
    element_logo.focus();
    for (i = 0; i < 4; ++i) {
      fireEvent.keyDown(header[i], {key: "ArrowRight", code: "ArrowRight"});
      expect(header[i+1]).toHaveFocus();
    }

    // verify left arrow key reverses progression of elements in same order
    for (i = 4; i > 0; --i) {
      fireEvent.keyDown(header[i], {key: "ArrowLeft", code: "ArrowLeft"});
      expect(header[i-1]).toHaveFocus();
    }
  });

});
