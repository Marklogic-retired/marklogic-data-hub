import React from "react";
import SearchBar from "./search-bar";
import {render, fireEvent, cleanup} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";

describe("Search Bar", () => {
  const entities = ["Person"];

  afterEach(cleanup);

  test("Verify the search bar and entity select options", () => {
    const {getByPlaceholderText, getByText, getByLabelText} = render(<SearchBar entities={entities} cardView={false}/>);
    const searchInput = getByPlaceholderText("Enter text to search for");
    expect(searchInput).toHaveAttribute("value", "");
    userEvent.type(searchInput, "test");
    expect(searchInput).toHaveAttribute("value", "test");
    expect(getByText("All Entities")).toBeInTheDocument();
    fireEvent.keyDown(getByLabelText("entity-select"), {key: "ArrowDown"});
    expect(getByText("Person")).toBeInTheDocument();
  });

});
