import React from "react";
import {mount} from "enzyme";
import SearchPaginationSimple from "./search-pagination-simple";

describe("Search Pagination Simple Component ", () => {
  let wrapper;

  describe("Count number of elements to change page ", () => {

    test("Renders pagination with 5 rows ", () => {
      wrapper = mount(
        <SearchPaginationSimple
          total={5}
          pageSize={2}
          pageNumber={1}
          maxRowsPerPage={2}
        />);
      expect(wrapper.find("#pagination ul li")).toHaveLength(5);
    });

    test("Renders pagination with 10 rows ", () => {
      wrapper = mount(
        <SearchPaginationSimple
          total={10}
          pageSize={2}
          pageNumber={1}
          maxRowsPerPage={2}
        />);
      expect(wrapper.find("#pagination ul li")).toHaveLength(7);
    });

    test("verify not showing pagination controls if not necessary ", () => {
      wrapper = mount(
        <SearchPaginationSimple
          total={5}
          pageSize={5}
          pageNumber={1}
          maxRowsPerPage={5}
        />);
      expect(wrapper.find("#pagination ul li")).toHaveLength(0);
    });
  });
});
