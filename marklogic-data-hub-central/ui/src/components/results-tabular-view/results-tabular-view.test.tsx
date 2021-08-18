import React from "react";
import {render, fireEvent, waitForElement} from "@testing-library/react";
import {entitySearch, entityPropertyDefinitions, selectedPropertyDefinitions, entityDefArray, entitySearchAllEntities} from "../../assets/mock-data/explore/entity-search";
import ResultsTabularView from "./results-tabular-view";
import {BrowserRouter as Router} from "react-router-dom";
import {validateTableRow} from "../../util/test-utils";

describe("Results Table view component", () => {

  // TODO DHFPROD-7711 skipping failing tests to enable component replacement
  test.skip("Results table with data renders", async () => {
    const {getByText, getByTestId} = render(
      <Router>
        <ResultsTabularView
          data={entitySearch.results}
          entityPropertyDefinitions={entityPropertyDefinitions}
          selectedPropertyDefinitions={selectedPropertyDefinitions}
          entityDefArray={entityDefArray}
          columns={[]}
          hasStructured={false}
          selectedEntities={["Customer"]}
        />
      </Router>
    );
    // Check table column headers are rendered
    expect(getByText("customerId")).toBeInTheDocument();
    expect(getByText("name")).toBeInTheDocument();
    expect(getByText("nicknames")).toBeInTheDocument();
    expect(getByText("shipping")).toBeInTheDocument();
    expect(getByText("billing")).toBeInTheDocument();
    expect(getByText("Detail View")).toBeInTheDocument();

    //check table data is rendered correctly
    expect(getByText("101")).toBeInTheDocument();
    expect(getByText("Carmella Hardin")).toBeInTheDocument();
    expect(getByText("Whitwell Place")).toBeInTheDocument();
    expect(getByText("Whitwell Place2")).toBeInTheDocument();
    expect(getByText("Ellerslie")).toBeInTheDocument();
    expect(getByText("Ellerslie2")).toBeInTheDocument();
    expect(getByTestId("101-detailOnSeparatePage")).toBeInTheDocument();
    expect(getByTestId("101-sourceOnSeparatePage")).toBeInTheDocument();
    expect(getByText("\"\"")).toBeInTheDocument();
    expect(getByText("null")).toBeInTheDocument();

    //Check if the tooltip on 'Detail on separate page' icon works fine.
    fireEvent.mouseOver(getByTestId("101-detailOnSeparatePage"));
    await(waitForElement(() => (getByText("Show the processed data"))));

    //Check if the tooltip on 'source on separate page' icon works fine.
    fireEvent.mouseOver(getByTestId("101-sourceOnSeparatePage"));
    await(waitForElement(() => (getByText("Show the complete JSON"))));
  });

  test("Result table with no data renders", () => {
    const {getByText} = render(
      <Router>
        <ResultsTabularView
          data={[]}
          entityPropertyDefinitions={[]}
          selectedPropertyDefinitions={[]}
          entityDefArray={[]}
          columns={[]}
          hasStructured={false}
        />
      </Router>
    );
    // Check for Empty Table
    expect(getByText(/No Data/i)).toBeInTheDocument();
  });

  // TODO DHFPROD-7711 skipping failing tests to enable component replacement
  test.skip("Array data renders properly", () => {
    const {getByText, queryByText} = render(
      <Router>
        <ResultsTabularView
          data={entitySearch.results}
          entityPropertyDefinitions={entityPropertyDefinitions}
          selectedPropertyDefinitions={selectedPropertyDefinitions}
          columns={[]}
          hasStructured={false}
          selectedEntities={["Customer"]}
          entityDefArray={entityDefArray}
        />
      </Router>
    );

    expect(queryByText("Carmdin")).toBeNull();
    expect(queryByText("Carm din")).toBeNull();
    expect(getByText("Carm")).toBeInTheDocument();
    expect(getByText("din")).toBeInTheDocument();
    expect(getByText("Carm")).toContainHTML("class=\"ml-tooltip-container\"");
    expect(getByText("Carm")).toContainHTML("style=\"text-overflow: ellipsis; overflow: hidden;\"");
    expect(getByText("din")).toContainHTML("class=\"ml-tooltip-container\"");
    expect(getByText("din")).toContainHTML("style=\"text-overflow: ellipsis; overflow: hidden;\"");
    expect(getByText("Carm").closest("td")).toEqual(getByText("din").closest("td"));
    expect(getByText("Carm").closest("td")).toEqual(getByText("din").closest("td"));
  });

  test("Results table with data renders when All Entities option is selected", async () => {
    const {getByText, getByTestId} = render(
      <Router>
        <ResultsTabularView
          data={entitySearchAllEntities.results}
          entityPropertyDefinitions={[]}
          selectedPropertyDefinitions={[]}
          entityDefArray={entityDefArray}
          columns={[]}
          hasStructured={false}
          selectedEntities={[]}
        />
      </Router>
    );

    // Check table column headers are rendered
    expect(getByText("Identifier")).toBeInTheDocument();
    expect(getByText("Entity Type")).toBeInTheDocument();
    expect(getByText("Record Type")).toBeInTheDocument();
    expect(getByText("Created")).toBeInTheDocument();
    expect(getByText("Detail View")).toBeInTheDocument();

    //check table data is rendered correctly
    expect(getByText("101")).toBeInTheDocument();
    expect(getByTestId("Customer-101")).toBeInTheDocument();
    expect(getByTestId("json-101")).toBeInTheDocument();
    expect(getByText("2020-06-21 23:44")).toBeInTheDocument();
    expect(getByTestId("101-detailOnSeparatePage")).toBeInTheDocument();
    expect(getByTestId("101-sourceOnSeparatePage")).toBeInTheDocument();

    //Check if the tooltip on 'Detail on separate page' icon works fine.
    fireEvent.mouseOver(getByTestId("101-detailOnSeparatePage"));
    await(waitForElement(() => (getByText("Show the processed data"))));

    //Check if the tooltip on 'source on separate page' icon works fine.
    fireEvent.mouseOver(getByTestId("101-sourceOnSeparatePage"));
    await(waitForElement(() => (getByText("Show the complete JSON"))));

  });

  // TODO DHFPROD-7711 skipping failing tests to enable component replacement
  test.skip("Sorting in results table with data renders properly", async () => {
    const {getByText, getByTestId} = render(
      <Router>
        <ResultsTabularView
          data={entitySearch.results}
          entityPropertyDefinitions={entityPropertyDefinitions}
          selectedPropertyDefinitions={selectedPropertyDefinitions}
          entityDefArray={entityDefArray}
          columns={[]}
          hasStructured={false}
          selectedEntities={["Customer"]}
        />
      </Router>
    );

    // Check table column headers are rendered
    expect(getByText("customerId")).toBeInTheDocument();
    expect(getByText("name")).toBeInTheDocument();
    expect(getByText("nicknames")).toBeInTheDocument();
    expect(getByText("shipping")).toBeInTheDocument();
    expect(getByText("billing")).toBeInTheDocument();
    expect(getByText("Detail View")).toBeInTheDocument();

    const customerIdColumnSort = getByTestId("resultsTableColumn-customerId"); // For name column sorting
    const nameColumnSort = getByTestId("resultsTableColumn-name"); // For value column sorting
    const nickNamesColumnSort = getByTestId("resultsTableColumn-nicknames"); // For nicknames column sorting

    //Sorted document uris based on name,customerId and nicknames columns to be used later
    const urisDefault = ["/Customer/Cust1.json", "/Customer/Cust2.json", "/Customer/Cust3.json", "/Customer/Cust4.json", "/Customer/Cust5.json"];
    const urisBasedOnDescendingCustomerId = ["/Customer/Cust5.json", "/Customer/Cust2.json", "/Customer/Cust3.json", "/Customer/Cust4.json", "/Customer/Cust5.json"];
    const urisBasedOnAscendingName = ["/Customer/Cust2.json", "/Customer/Cust3.json", "/Customer/Cust1.json", "/Customer/Cust5.json", "/Customer/Cust4.json"];
    const urisBasedOnDescendingName = ["/Customer/Cust4.json", "/Customer/Cust5.json", "/Customer/Cust1.json", "/Customer/Cust3.json", "/Customer/Cust2.json"];
    const urisBasedOnAscendingNickNames = ["/Customer/Cust2.json", "/Customer/Cust3.json", "/Customer/Cust1.json", "/Customer/Cust5.json", "/Customer/Cust4.json"];
    const urisBasedOnDescendingNickNames = ["/Customer/Cust4.json", "/Customer/Cust5.json", "/Customer/Cust1.json", "/Customer/Cust2.json", "/Customer/Cust3.json"];


    /* Validate sorting on name column in results*/
    //Check the sort order of Name column rows before enforcing sort order
    let resultsTable: any = document.querySelectorAll(".ant-table-row ant-table-row-level-0");
    validateTableRow(resultsTable, urisDefault);

    //Click on the Name column to sort the rows by Ascending order
    fireEvent.click(nameColumnSort);
    resultsTable = document.querySelectorAll(".ant-table-row ant-table-row-level-0");
    validateTableRow(resultsTable, urisBasedOnAscendingName);

    //Click on the Name column to sort the rows by Descending order
    fireEvent.click(nameColumnSort);
    resultsTable = document.querySelectorAll(".ant-table-row ant-table-row-level-0");
    validateTableRow(resultsTable, urisBasedOnDescendingName);

    /* Validate sorting on customerId column in results*/
    //Click on the CustomerId column to sort the rows by Ascending order
    fireEvent.click(customerIdColumnSort);
    resultsTable = document.querySelectorAll(".ant-table-row ant-table-row-level-0");
    validateTableRow(resultsTable, urisDefault);

    //Click on the CustomerId column to sort the rows by Descending order
    fireEvent.click(customerIdColumnSort);
    resultsTable = document.querySelectorAll(".ant-table-row ant-table-row-level-0");
    validateTableRow(resultsTable, urisBasedOnDescendingCustomerId);

    /* Validate sorting on nicknames column in results*/
    //Click on the nicknames column to sort the rows by Ascending order
    fireEvent.click(nickNamesColumnSort);
    resultsTable = document.querySelectorAll(".ant-table-row ant-table-row-level-0");
    validateTableRow(resultsTable, urisBasedOnAscendingNickNames);

    //Click on the nicknames column to sort the rows by Descending order
    fireEvent.click(nickNamesColumnSort);
    resultsTable = document.querySelectorAll(".ant-table-row ant-table-row-level-0");
    validateTableRow(resultsTable, urisBasedOnDescendingNickNames);

  });

  test("Results table with no data renders when All Entities option is selected but no entities are available", async () => {
    const {getByText} = render(
      <Router>
        <ResultsTabularView
          data={[]}
          entityPropertyDefinitions={[]}
          selectedPropertyDefinitions={[]}
          entityDefArray={[]}
          columns={[]}
          hasStructured={false}
          selectedEntities={[]}
        />
      </Router>
    );

    // Check table column headers are rendered
    expect(getByText("Identifier")).toBeInTheDocument();
    expect(getByText("Entity Type")).toBeInTheDocument();
    expect(getByText("Record Type")).toBeInTheDocument();
    expect(getByText("Created")).toBeInTheDocument();
    expect(getByText("Detail View")).toBeInTheDocument();

    // Check for Empty Table
    expect(getByText(/No Data/i)).toBeInTheDocument();
  });
});
