import Query, {Props} from "./queries";

import React from "react";
import {getQueriesResponse} from "../../assets/mock-data/explore/query";
import {render} from "@testing-library/react";

const defaultProps: Props = {
  queries: getQueriesResponse,
  isSavedQueryUser: false,
  columns: [],
  entities: [],
  selectedFacets: [],
  greyFacets: [],
  isColumnSelectorTouched: false,
  entityDefArray: [],
  setColumnSelectorTouched: jest.fn(),
  setQueries: jest.fn(),
  setIsLoading: jest.fn(),
  database: "final",
  setCardView: jest.fn(),
  cardView: false,
  toggleApply: jest.fn(),
  toggleApplyClicked: jest.fn(),
  setCurrentBaseEntities: jest.fn(),
};
describe("Queries Component", () => {
  test("Verify save query button does not exist", () => {
    const newProps = {
      ...defaultProps,

      selectedFacets: [{constraint: "lastname", facet: "Adams", displayName: ""},
        {constraint: "lastname", facet: "Coleman", displayName: ""}],
      greyFacets: [{constraint: "lastname", facet: "paul", displayName: ""},
        {constraint: "lastname", facet: "avalon", displayName: ""}]
    };

    const {queryByTitle} = render(<Query {...newProps} />);
    expect(queryByTitle("save-query")).not.toBeInTheDocument();
  });
  test("Verify clear query button exist", () => {
    const {getByLabelText} = render(<Query {...defaultProps} />);
    expect(getByLabelText("clear-query")).toBeInTheDocument();
  });

  test("Verify edit query button does not exist", () => {
    const newProps = {
      ...defaultProps,
      selectedFacets: [{constraint: "lastname", facet: "Adams", displayName: ""},
        {constraint: "lastname", facet: "Coleman", displayName: ""}]
    };
    const {queryByTitle} = render(<Query {...newProps} />);
    expect(queryByTitle("edit-query")).not.toBeInTheDocument();
  });

  test("Verify discard changes button does not exist", () => {
    const {queryByTitle} = render(<Query {...defaultProps}
      queries={getQueriesResponse}
      setQueries={jest.fn()}
      isSavedQueryUser={false}
      selectedFacets={[{constraint: "lastname", facet: "Adams", displayName: ""},
        {constraint: "lastname", facet: "Coleman", displayName: ""}]}
      greyFacets={[{constraint: "lastname", facet: "paul", displayName: ""},
        {constraint: "lastname", facet: "avalon", displayName: ""}]}
      setColumnSelectorTouched={jest.fn()}
    />);
    expect(queryByTitle("discard-changes")).not.toBeInTheDocument();
  });

  test("Verify save changes button does not exist", () => {
    const {queryByTitle} = render(<Query {...defaultProps} />);
    expect(queryByTitle("save-changes")).not.toBeInTheDocument();
  });

  test("Verify reset changes button is disabled", () => {
    const {queryByTitle} = render(<Query
    {...defaultProps}
      queries={getQueriesResponse}
      setQueries={jest.fn()}
      isSavedQueryUser={false}
      selectedFacets={[]}
      greyFacets={[]}
      setColumnSelectorTouched={jest.fn()}
    />);
    expect(queryByTitle("reset-changes")).not.toBeInTheDocument();
    expect(queryByTitle("reset-changes-disabled")).toBeInTheDocument();
  });

  test("Verify query list and reset changes icon don't exist", () => {
    const newProps = {
      ...defaultProps,
      selectedFacets: [{constraint: "Collection", facet: "Person", displayName: ""}],
      greyFacets: [{constraint: "Collection", facet: "Order", displayName: ""}],
      cardView: true
    };
    const {queryByTestId, queryByTitle} = render(<Query {...newProps}/>);
    expect(queryByTestId("dropdown-list")).toBeNull();
    expect(queryByTitle("reset-changes")).toBeNull();
  });
});
