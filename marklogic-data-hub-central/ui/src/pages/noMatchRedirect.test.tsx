import {fireEvent, render} from "@testing-library/react";

import {AuthoritiesContext} from "../util/authorities";
import NoMatchRedirect from "./noMatchRedirect";
import React from "react";
import {Router} from "react-router";
import {UserContext} from "../util/user-context";
import authorities from "../assets/mock-data/authorities.testutils";
import {createMemoryHistory} from "history";
import {userAuthenticated} from "../assets/mock-data/user-context-mock";

const history = createMemoryHistory();

const testAsDeveloper = authorities.DeveloperRolesService;

describe("noMatchRedirect component test", () => {
  test("Verify error page redirects correctly when \"Back Home\" is clicked", async () => {
    const {getByText, getByLabelText, rerender} = render(
      <Router history={history}>
        <NoMatchRedirect />
      </Router>,
    );

    await (() => expect(getByText("Operation failed")).toBeInTheDocument());
    await (() => expect(getByText("The operation failed due to an unknown error.")).toBeInTheDocument());

    //Should redirect to / when not authenticated
    fireEvent.click(getByLabelText("Back"));
    expect(history.location.pathname.endsWith("/")).toBeTruthy();

    //Should redirect to the previous page when authenticated
    rerender(
      <Router history={history}>
        <AuthoritiesContext.Provider value={testAsDeveloper}>
          <UserContext.Provider value={userAuthenticated}>
            <NoMatchRedirect />
          </UserContext.Provider>
        </AuthoritiesContext.Provider>
      </Router>,
    );
    fireEvent.click(getByLabelText("Back"));
    expect(history.location.pathname.endsWith("/tiles")).toBeTruthy();
  });
});
