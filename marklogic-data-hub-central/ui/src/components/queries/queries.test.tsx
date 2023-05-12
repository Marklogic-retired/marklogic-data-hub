import React from "react";
import {render} from "@testing-library/react";
import Query from "./queries";
import {getQueriesResponse} from "../../assets/mock-data/explore/query";

const queryElementProperties = render(
  <Query
    queries={getQueriesResponse}
    setQueries={jest.fn()}
    isSavedQueryUser={false}
    selectedFacets={[
      {constraint: "lastname", facet: "Adams", displayName: ""},
      {constraint: "lastname", facet: "Coleman", displayName: ""},
    ]}
    greyFacets={[
      {constraint: "lastname", facet: "paul", displayName: ""},
      {constraint: "lastname", facet: "avalon", displayName: ""},
    ]}
    setColumnSelectorTouched={jest.fn()}
    columns={[]}
    entities={[]}
    isColumnSelectorTouched={false}
    entityDefArray={[]}
    setIsLoading={jest.fn()}
    database={""}
    setCardView={""}
    cardView={false}
    toggleApply={jest.fn()}
    toggleApplyClicked={jest.fn()}
    setCurrent={jest.fn()}
  />,
);

describe("Queries Component", () => {
  test("Verify save query button does not exist", () => {
    const {queryByTitle} = queryElementProperties;
    expect(queryByTitle("save-query")).not.toBeInTheDocument();
  });
  test("Verify clear query button exist", () => {
    const {getByLabelText} = render(
      <Query
        cardView={false}
        queries={getQueriesResponse}
        setQueries={jest.fn()}
        isSavedQueryUser={false}
        selectedFacets={[]}
        greyFacets={[]}
        setColumnSelectorTouched={jest.fn()}
        columns={[]}
        entities={[]}
        isColumnSelectorTouched={false}
        entityDefArray={[]}
        setIsLoading={jest.fn()}
        database={""}
        setCardView={""}
        toggleApply={jest.fn()}
        toggleApplyClicked={jest.fn()}
        setCurrent={jest.fn()}
      />,
    );
    expect(getByLabelText("clear-query")).toBeInTheDocument();
  });

  test("Verify edit query button does not exist", () => {
    const {queryByTitle} = queryElementProperties;
    expect(queryByTitle("edit-query")).not.toBeInTheDocument();
  });

  test("Verify discard changes button does not exist", () => {
    const {queryByTitle} = queryElementProperties;
    expect(queryByTitle("discard-changes")).not.toBeInTheDocument();
  });

  test("Verify save changes button does not exist", () => {
    const {queryByTitle} = queryElementProperties;
    expect(queryByTitle("save-changes")).not.toBeInTheDocument();
  });

  test("Verify reset changes button does not exist", () => {
    const {queryByTitle} = queryElementProperties;
    expect(queryByTitle("reset-changes")).not.toBeInTheDocument();
  });

  test("Verify query list and reset changes icon don't exist", () => {
    const {queryByTestId, queryByTitle} = queryElementProperties;
    expect(queryByTestId("dropdown-list")).toBeNull();
    expect(queryByTitle("reset-changes")).toBeNull();
  });
});
