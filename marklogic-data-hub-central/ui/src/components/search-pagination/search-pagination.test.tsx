import React from "react";
import {mount} from "enzyme";
import SearchPagination from "./search-pagination";

describe("Search Pagination component", () => {
  let wrapper;

  describe("change current page", () => {

    test("renders", () => {
      wrapper = mount(
        <SearchPagination
          total={11}
          pageSize={20}
          pageNumber={1}
          pageLength={1}
          maxRowsPerPage={20}
        />);

      expect(wrapper.find(`.pagination`)).toHaveLength(1);
      const pageSize = wrapper.find(`select[data-testid="pageSizeSelect"]`);
      expect(pageSize.props().value).toBe(20);
    });

    test("verify not showing pagination controls if 0 or 1 pages ", () => {
      wrapper = mount(
        <SearchPagination
          total={10}
          pageSize={20}
          pageNumber={1}
          pageLength={1}
          maxRowsPerPage={20}
        />);
      expect(wrapper.find(".pagination")).toHaveLength(0);
    });

  });
});
