import React from "react";
import {render, fireEvent, waitForElement} from "@testing-library/react";
import {BrowserRouter as Router} from "react-router-dom";
import JobResultsTableView from "./job-results-table-view";
import {jobResults} from "../../assets/mock-data/monitor/job-results";
import {validateTableRow} from "../../util/test-utils";
import moment from "moment";


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
    let ts: string = jobResults.results[0].startTime; // "2021-04-21T20:37:42.962833-05:00"
    let tsExpected: string = moment(ts).format("YYYY-MM-DD HH:mm");
    expect(getByText(tsExpected)).toBeInTheDocument(); // "2021-04-21 20:37"
    expect(getByText("0s 66ms")).toBeInTheDocument();
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

describe("Column Selector in Job results Table view component", () => {
  test("Verify default values are checked", async () => {
    const {getByText, getByTestId} = render(
      <Router>
        <JobResultsTableView
          data={jobResults.results}
        />
      </Router>
    );

    expect(getByTestId("column-selector-icon")).toBeInTheDocument();
    fireEvent.mouseOver(getByTestId("column-selector-icon"));
    await (waitForElement(() => (getByText("Select the columns to display."))));
    await fireEvent.click(getByTestId("column-selector-icon"));
    expect(getByTestId("columnOptionsCheckBox-user")).toBeInTheDocument();
    expect(getByTestId("columnOptionsCheckBox-user")).toBeChecked();
    expect(getByTestId("columnOptionsCheckBox-flowName")).toBeInTheDocument();
    expect(getByTestId("columnOptionsCheckBox-flowName")).toBeChecked();
  });

  test("Verify Cancel button", async () => {
    const {getByText, getByTestId} = render(
      <Router>
        <JobResultsTableView
          data={jobResults.results}
        />
      </Router>
    );

    expect(getByTestId("column-selector-icon")).toBeInTheDocument();
    await fireEvent.click(getByTestId("column-selector-icon"));
    expect(getByTestId("columnOptionsCheckBox-user")).toBeInTheDocument();
    expect(getByTestId("columnOptionsCheckBox-flowName")).toBeInTheDocument();
    fireEvent.click(getByTestId("columnOptionsCheckBox-user"));
    expect(getByTestId("columnOptionsCheckBox-user")).not.toBeChecked();

    const cancelButton = getByText("Cancel");
    expect(cancelButton).toBeInTheDocument();
    fireEvent.click(cancelButton);

    expect(getByTestId("column-selector-icon")).toBeInTheDocument();
    await fireEvent.click(getByTestId("column-selector-icon"));
    expect(getByTestId("columnOptionsCheckBox-user")).toBeChecked();
    expect(getByTestId("columnOptionsCheckBox-flowName")).toBeChecked();
  });

  test("Verify Apply button", async () => {
    const {getByText, getByTestId, queryByText} = render(
      <Router>
        <JobResultsTableView
          data={jobResults.results}
        />
      </Router>
    );

    // Check table Configurable column headers are rendered
    expect(getByText("User")).toBeInTheDocument();
    expect(getByText("Job ID")).toBeInTheDocument();
    expect(getByText("Flow Name")).toBeInTheDocument();

    //check table data is rendered correctly
    expect(getByText("pari")).toBeInTheDocument();
    expect(getByText("61040854-2894-44b9-8fbd-fc6e71357692")).toBeInTheDocument();
    expect(getByText("convertedFlow")).toBeInTheDocument();

    expect(getByTestId("column-selector-icon")).toBeInTheDocument();
    await fireEvent.click(getByTestId("column-selector-icon"));
    expect(getByTestId("columnOptionsCheckBox-user")).toBeChecked();
    expect(getByTestId("columnOptionsCheckBox-flowName")).toBeChecked();

    fireEvent.click(getByTestId("columnOptionsCheckBox-user"));
    expect(getByTestId("columnOptionsCheckBox-user")).not.toBeChecked();
    fireEvent.click(getByTestId("columnOptionsCheckBox-flowName"));
    expect(getByTestId("columnOptionsCheckBox-flowName")).not.toBeChecked();

    const applyButton = getByText("Apply");
    expect(applyButton).toBeInTheDocument();
    await fireEvent.click(applyButton);

    //check table data is rendered correctly
    expect(queryByText("pari")).not.toBeInTheDocument();
    expect(getByText("61040854-2894-44b9-8fbd-fc6e71357692")).toBeInTheDocument();
    expect(queryByText("convertedFlow")).not.toBeInTheDocument();
  });
});
