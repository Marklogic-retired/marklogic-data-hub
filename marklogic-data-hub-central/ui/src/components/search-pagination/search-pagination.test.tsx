import React from "react";
import {render, cleanup} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import SearchPagination from "@components/search-pagination/search-pagination";

describe("Search Pagination Simple Component", () => {
  afterEach(cleanup);
  describe("change current page", () => {
    test("renders", () => {
      const {getByTestId, getByText} = render(
        <SearchPagination total={11} pageSize={10} pageNumber={1} pageLength={1} maxRowsPerPage={20} />,
      );

      // pagination will have 'Previous', '1', '2', 'Next' values. Hence, verifying the length to be 4.
      expect(getByTestId("pagination").children.length).toBe(4);
      // checking if the pageSize is 10 rows per page
      expect(getByText("10 / page")).toBeInTheDocument();
    });

    test("No pagination when there is 0 or 1 page", () => {
      const {queryByTestId} = render(
        <SearchPagination total={10} pageSize={20} pageNumber={1} pageLength={1} maxRowsPerPage={20} />,
      );
      expect(queryByTestId("pagination")).toBeNull();
    });
  });
});
