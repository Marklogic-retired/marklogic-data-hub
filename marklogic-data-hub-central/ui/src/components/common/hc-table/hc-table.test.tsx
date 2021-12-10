import React from "react";
import {cleanup, render} from "@testing-library/react";
import HCTable from "./hc-table";
import {fireEvent, within} from "@testing-library/dom";
import data from "../../../assets/mock-data/curation/common.data";

describe("Hub Central Table component", () => {
  afterEach(() => {
    cleanup();
  });

  test("should render a HCTable component", () => {
    const {getByText} = render(<HCTable rowKey="name" data={data.loadData.data} columns={data.loadTableColumns} />);
    const tableColumns = within(getByText("Name").closest("tr"));

    expect(tableColumns.getByText("Name")).toBeInTheDocument();
    expect(tableColumns.getByText("Description")).toBeInTheDocument();
    expect(tableColumns.getByText("Source Format")).toBeInTheDocument();
    expect(tableColumns.getByText("Target Format")).toBeInTheDocument();
    expect(tableColumns.getByText("Last Updated")).toBeInTheDocument();
    expect(tableColumns.getByText("Action")).toBeInTheDocument();

  });

  test("should render a 'No Data' indicator when the table does not have elements", () => {
    const {getByText} = render(<HCTable rowKey="name" data={[]} columns={data.loadTableColumns} />);

    expect(getByText("No Data")).toBeInTheDocument();
  });

  test("should allow pagination over the HCTable", () => {
    const {container} = render(<HCTable
      rowKey="name"
      data={data.loadDataPagination.data}
      columns={data.loadTableColumns}
      pagination={{
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 30, 40],
        defaultCurrent: 1,
        current: 1,
        pageSize: 10
      }} />);

    expect(container.querySelectorAll(".hc-table_row")).toHaveLength(10);
    expect(container.querySelector(".react-bootstrap-table-page-btns-ul li[title=\"1\"]")).toBeInTheDocument();
    expect(container.querySelector(".react-bootstrap-table-page-btns-ul li[title=\"2\"]")).toBeInTheDocument();
    expect(container.querySelector(".react-bootstrap-table-pagination #size-per-page")).toHaveTextContent("10 / page");
  });

  test("should allow pagination over the HCTable without showing the size changer", () => {
    const {container} = render(<HCTable
      rowKey="name"
      data={data.loadDataPagination.data}
      columns={data.loadTableColumns}
      pagination={{
        showSizeChanger: false,
        defaultCurrent: 1,
        current: 1,
        pageSize: 10
      }} />);

    expect(container.querySelectorAll(".hc-table_row")).toHaveLength(10);
    expect(container.querySelector(".react-bootstrap-table-page-btns-ul li[title=\"1\"]")).toBeInTheDocument();
    expect(container.querySelector(".react-bootstrap-table-page-btns-ul li[title=\"2\"]")).toBeInTheDocument();
    expect(container.querySelector(".react-bootstrap-table-pagination #size-per-page")).not.toBeInTheDocument();
  });

  test("should allow sorting columns after clicking on the header", () => {
    const {getByText, container} = render(<HCTable rowKey="name" data={data.loadData.data} columns={data.loadTableColumns} />);
    const tableColumns = within(getByText("Name").closest("tr"));
    const tableRowCells = container.querySelectorAll(".hc-table_row td");

    expect(tableRowCells[0]).toHaveTextContent("testLoadXML");

    fireEvent.click(tableColumns.getByText("Name"));

    expect(container.querySelectorAll(".hc-table_row td")[0]).toHaveTextContent("testLoad");
  });
});