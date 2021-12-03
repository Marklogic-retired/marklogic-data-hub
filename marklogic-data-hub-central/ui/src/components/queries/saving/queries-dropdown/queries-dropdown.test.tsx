import React from "react";
import {render, fireEvent, cleanup} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import QueriesDropdown from "./queries-dropdown";

describe("Query Dropdown", () => {

  afterEach(cleanup);

  test("Render query dropdown", () => {
    const {getByLabelText} = render(
      <QueriesDropdown
        savedQueryList={[{name: "newclients"}]}
        currentQueryName={""}
      />
    );
    const dropdown = getByLabelText("queries-dropdown-list");
    expect(dropdown).toBeInTheDocument();
  });

  test("Explore query dropdown option", () => {
    const {getByLabelText} = render(
      <QueriesDropdown
        savedQueryList={[{name: "newcustomers"}]}
        currentQueryName={""}
      />
    );
    fireEvent.keyDown(getByLabelText("queries-dropdown-list"), {key: "ArrowDown"});
    expect(getByLabelText("query-option-newcustomers")).toBeInTheDocument();
  });

  test("Current query selected", () => {
    const {getByText} = render(
      <QueriesDropdown
        savedQueryList={[{name: "newsport"}]}
        currentQueryName={"newsport"}
      />
    );
    expect(getByText("newsport")).toBeInTheDocument();
  });

});
