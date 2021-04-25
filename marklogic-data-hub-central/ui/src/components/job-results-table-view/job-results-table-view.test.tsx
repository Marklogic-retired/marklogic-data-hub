import React from "react";
import {render, fireEvent, waitForElement} from "@testing-library/react";
import {BrowserRouter as Router} from "react-router-dom";
import JobResultsTableView from "./job-results-table-view";
import {jobResults} from "../../assets/mock-data/monitor/job-results";
import {validateTableRow} from "../../util/test-utils";


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

  test("Sorting in job results table with data renders properly", async () => {
    const {getByText} = render(
      <Router>
        <JobResultsTableView
          data={jobResults.results}
        />
      </Router>
    );

    const stepNameColumnSort = getByText("Step Name"); // For name column sorting
    const stepTypeColumnSort = getByText("Step Type");

    //Sorted documents based on stepName,Entity name columns to be used later
    const stepNameDefault = ["mapClientJSON", "loadClientJSON", "map-orders"];
    const stepNameDescending = ["mapClientJSON", "map-orders", "loadClientJSON"];
    const stepNameAscending = ["loadClientJSON", "map-orders", "mapClientJSON"];
    const stepTypeDefault = ["mapping", "ingestion", "mappingOrder"];
    const stepTypeDescending = ["mappingOrder", "mapping", "ingestion"];
    const stepTypeAscending = ["ingestion", "mapping", "mappingOrder"];


    /* Validate sorting on step name column in results*/
    //Check the sort order of step Name column rows before enforcing sort order
    let resultsTable: any = document.querySelectorAll(".ant-table-row ant-table-row-level-0");
    validateTableRow(resultsTable, stepNameDefault);

    //Click on the step Name column to sort the rows by Ascending order
    fireEvent.click(stepNameColumnSort);
    resultsTable = document.querySelectorAll(".ant-table-row ant-table-row-level-0");
    validateTableRow(resultsTable, stepNameAscending);

    //Click on the step Name column to sort the rows by Descending order
    fireEvent.click(stepNameColumnSort);
    resultsTable = document.querySelectorAll(".ant-table-row ant-table-row-level-0");
    validateTableRow(resultsTable, stepNameDescending);

    /* Validate sorting on step type column in results*/
    //Check the sort order of step type column rows before enforcing sort order
    validateTableRow(resultsTable, stepTypeDefault);

    //Click on the step type column to sort the rows by Ascending order
    fireEvent.click(stepTypeColumnSort);
    resultsTable = document.querySelectorAll(".ant-table-row ant-table-row-level-0");
    validateTableRow(resultsTable, stepTypeAscending);

    //Click on the step type column to sort the rows by Descending order
    fireEvent.click(stepTypeColumnSort);
    resultsTable = document.querySelectorAll(".ant-table-row ant-table-row-level-0");
    validateTableRow(resultsTable, stepTypeDescending);

  });
});
