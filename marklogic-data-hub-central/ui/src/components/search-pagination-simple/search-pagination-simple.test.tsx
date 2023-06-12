import React from "react";
import {render, cleanup} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import SearchPaginationSimple from "@components/search-pagination-simple/search-pagination-simple";

describe("Search Pagination Simple Component", () => {
  afterEach(cleanup);

  describe("Count number of elements to change page ", () => {
    test("Renders pagination with 5 rows ", () => {
      const {getByTestId, getByText, getAllByRole} = render(
        <SearchPaginationSimple total={5} pageSize={2} pageNumber={1} maxRowsPerPage={2} />,
      );
      expect(getByTestId("pagination")).toBeInTheDocument();
      expect(getByTestId("pagination-item-1")).toBeInTheDocument();
      expect(getByTestId("pagination-item-2")).toBeInTheDocument();
      expect(getByTestId("pagination-item-3")).toBeInTheDocument();
      expect(getByText("Next")).toBeInTheDocument();
      expect(getByText("Previous")).toBeInTheDocument();
      // Includes the Previous and Next in the list.
      expect(getAllByRole("listitem").length).toBe(5);
    });

    test("Renders pagination with 10 rows ", () => {
      const {getByTestId, getByText, getAllByRole} = render(
        <SearchPaginationSimple total={10} pageSize={2} pageNumber={1} maxRowsPerPage={2} />,
      );
      expect(getByTestId("pagination")).toBeInTheDocument();
      expect(getByTestId("pagination-item-1")).toBeInTheDocument();
      expect(getByTestId("pagination-item-2")).toBeInTheDocument();
      expect(getByTestId("pagination-item-3")).toBeInTheDocument();
      expect(getByTestId("pagination-item-4")).toBeInTheDocument();
      expect(getByTestId("pagination-item-5")).toBeInTheDocument();
      expect(getByText("Next")).toBeInTheDocument();
      expect(getByText("Previous")).toBeInTheDocument();
      // Includes the Previous and Next in the list.
      expect(getAllByRole("listitem").length).toBe(7);
    });

    test("Renders pagination with negative input", () => {
      const {getByTestId} = render(
        <SearchPaginationSimple total={1} pageSize={-1} pageNumber={1} maxRowsPerPage={2} />,
      );
      expect(getByTestId("pagination-container")).toBeInTheDocument();
    });

    test("Verify not showing pagination controls if not necessary", () => {
      const {queryByTestId} = render(
        <SearchPaginationSimple total={5} pageSize={5} pageNumber={1} maxRowsPerPage={5} />,
      );

      expect(queryByTestId("pagination")).toBeNull();
    });
  });
});
