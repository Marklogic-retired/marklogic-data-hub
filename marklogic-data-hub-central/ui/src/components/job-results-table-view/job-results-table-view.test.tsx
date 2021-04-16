import React from "react";
import {render, fireEvent, waitForElement} from "@testing-library/react";
import {BrowserRouter as Router} from "react-router-dom";
import JobResultsTableView from "./job-results-table-view";
import {jobResults} from "../../assets/mock-data/monitor/job-results";


describe("Job results Table view component", () => {
  test("Job Results table with data renders", async () => {
    const {getByText, getByTestId} = render(
      <Router>
        <JobResultsTableView
          data={jobResults.results}
        />
      </Router>
    );
    // Check table column headers are rendered
    expect(getByText("Step Name")).toBeInTheDocument();
    expect(getByText("Step Type")).toBeInTheDocument();
    expect(getByText("Status")).toBeInTheDocument();
    expect(getByText("Entity")).toBeInTheDocument();
    expect(getByText("Start Time")).toBeInTheDocument();
    expect(getByText("Duration")).toBeInTheDocument();

    //check table data is rendered correctly
    expect(getByText("mapClientJSON")).toBeInTheDocument();
    expect(getByText("mapping")).toBeInTheDocument();
    expect(getByText("2021-04-21 20:37")).toBeInTheDocument();
    expect(getByText("0.066399s")).toBeInTheDocument();
    expect(getByText("pari")).toBeInTheDocument();

    //Check if the tooltip on 'completed Status works fine'.
    fireEvent.mouseOver(getByTestId("success"));
    await (waitForElement(() => (getByText("Completed Successfully"))));

    //Check if the tooltip on 'Finished with errors works fine'.
    fireEvent.mouseOver(getByTestId("error"));
    await (waitForElement(() => (getByText("Completed With Errors"))));

    //Check if the tooltip on 'Running status works fine'.
    fireEvent.mouseOver(getByTestId("progress"));
    await (waitForElement(() => (getByText("Running"))));
  });

  test("Job result table with no data renders", () => {
    const {getByText} = render(
      <Router>
        <JobResultsTableView
          data={[]}
        />
      </Router>
    );
    // Check for Empty Table
    expect(getByText(/No Data/i)).toBeInTheDocument();
  });
});
