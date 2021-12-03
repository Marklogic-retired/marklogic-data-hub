import React from "react";
import {render, fireEvent} from "@testing-library/react";
import ZeroStateExplorer from "./zero-state-explorer";
import tiles from "../../config/tiles.config";

describe("zero state explorer component", () => {

  let entities = ["FirstName", "OneNested", "OrderDetail", "Order", "Person", "Name"];
  let queries = [{"savedQuery": {"id": "e6b354b1-07c9-47f1-a4e8-d9b95d655aad", "name": "query1", "description": "", "query": {"searchText": "", "entityTypeIds": ["Order"], "selectedFacets": {"ShipCountry": {"dataType": "xs:string", "stringValues": ["USA"]}, "ShipCity": {"dataType": "xs:string", "stringValues": ["Boise"]}}}, "propertiesToDisplay": ["OrderID", "OrderDate", "StringField1", "StringField2", "StringField3", "NumberField1", "NumberField2", "NumberField3", "BooleanField1", "BooleanField2", "OrderDetails", "CustomerID", "ShipCountry", "ShipCity", "person", "Phone"], "owner": "admin", "systemMetadata": {"createdBy": "admin", "createdDateTime": "2020-06-03T08:05:19.415998-07:00", "lastUpdatedBy": "admin", "lastUpdatedDateTime": "2020-06-03T08:05:19.415998-07:00"}}}];
  let columns = ["OrderID", "OrderDate", "StringField1", "StringField2", "StringField3", "NumberField1"];

  test("Verify Zero State components renders", () => {
    const {getByText, getByPlaceholderText, getByLabelText} = render(<ZeroStateExplorer entities={entities} setEntity={jest.fn()} isSavedQueryUser={true} queries={queries} hasStructured={false} columns={columns} setIsLoading={jest.fn()} tableView={true} toggleTableView={jest.fn()} />);
    expect(getByText(tiles.explore.intro)).toBeInTheDocument(); // tile intro text
    expect(getByText("All Entities")).toBeInTheDocument();
    expect(getByText("What do you want to explore?")).toBeInTheDocument();
    expect(getByText("- or -")).toBeInTheDocument();
    const searchInput = getByPlaceholderText("Enter text to search for");
    expect(searchInput).toHaveAttribute("value", "");
    expect(getByLabelText("entity-select")).toBeInTheDocument();
    expect(getByLabelText("query-select")).toBeInTheDocument();
    expect(document.querySelector("[aria-label=\"switch-database-final\"]")).toBeInTheDocument();
    expect(document.querySelector("[aria-label=\"switch-database-staging\"]")).toBeInTheDocument();
  });

  test("Verify Zero State components renders when user does not have save query role", () => {
    const {getByTestId, getByText, queryByText, getByLabelText, queryByLabelText} = render(<ZeroStateExplorer entities={entities} setEntity={jest.fn()} isSavedQueryUser={false} queries={queries} hasStructured={false} columns={columns} setIsLoading={jest.fn()} tableView={true} toggleTableView={jest.fn()} />);
    expect(getByText(tiles.explore.intro)).toBeInTheDocument(); // tile intro text
    expect(getByText("All Entities")).toBeInTheDocument();
    expect(getByText("What do you want to explore?")).toBeInTheDocument();
    expect(getByTestId("search-bar")).toBeInTheDocument();
    expect(getByLabelText("entity-select")).toBeInTheDocument();
    expect(queryByText("- or -")).not.toBeInTheDocument();
    expect(queryByLabelText("query-select")).toBeNull();
  });

  test("Verify setQuery gets called", () => {
    const {getByTestId} = render(<ZeroStateExplorer entities={entities} setEntity={jest.fn()} isSavedQueryUser={true} queries={queries} hasStructured={false} columns={columns} setIsLoading={jest.fn()} tableView={true} toggleTableView={jest.fn()}/>);
    const searchInput = getByTestId("search-bar");
    searchInput.onchange = jest.fn();
    fireEvent.change(searchInput, {target: {value: "Person"}});
    expect(searchInput["value"]).toBe("Person");
    expect(searchInput.onchange).toHaveBeenCalledTimes(1);
  });

  test("Verify onClickExplore gets called", () => {
    const {getByText} = render(<ZeroStateExplorer entities={entities} setEntity={jest.fn()} isSavedQueryUser={true} queries={queries} hasStructured={false} setCardView={jest.fn()} columns={columns} setIsLoading={jest.fn()} tableView={true} toggleTableView={jest.fn()} setDatabasePreferences={jest.fn()} toggleDataHubArtifacts={jest.fn()}/>);
    const exploreButton = getByText("Explore");
    exploreButton.onclick = jest.fn();
    fireEvent.click(exploreButton);
    expect(exploreButton.onclick).toHaveBeenCalledTimes(1);
  });

  test("Verify entity dropdown option auto selection", () => {
    const {getByText, getByLabelText, queryByText} = render(<ZeroStateExplorer entities={entities} setEntity={jest.fn()} isSavedQueryUser={true} queries={queries} hasStructured={false} setCardView={jest.fn()} columns={columns} setIsLoading={jest.fn()} tableView={true} toggleTableView={jest.fn()} setDatabasePreferences={jest.fn()} toggleDataHubArtifacts={jest.fn()}/>);
    const finalButton = getByLabelText("switch-database-final");
    const stagingButton = getByLabelText("switch-database-staging");

    //verify auto selection of All Data option when staging database is selected
    stagingButton && fireEvent.click(stagingButton);
    expect(getByText("All Data")).toBeInTheDocument();
    expect(getByText("All Data")).toBeVisible();
    expect(queryByText("All Entities")).toBeNull();

    //verify auto selection of All Entities option when final database is selected
    finalButton && fireEvent.click(finalButton);
    expect(getByText("All Entities")).toBeInTheDocument();
    expect(getByText("All Entities")).toBeVisible();
    expect(queryByText("All Data")).toBeNull();
  });
});
