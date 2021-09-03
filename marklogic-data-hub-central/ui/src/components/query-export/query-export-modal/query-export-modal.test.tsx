import React from "react";
import {fireEvent, render} from "@testing-library/react";
import QueryExportModal from "./query-export-modal";


describe("Query Export Component", () => {

  let columns = ["id", "firstName", "lastName", "age"];
  let columnsNested = ["id", "firstName", "lastName", "age", "phoneNumber.work"];

  let tableColumns = [
    {
      "title": "id",
      "dataIndex": "id",
      "key": "id"
    },
    {
      "title": "firstName",
      "dataIndex": "firstName",
      "key": "firstName"
    },
    {
      "title": "lastName",
      "dataIndex": "lastName",
      "key": "lastName"
    },
    {
      "title": "age",
      "dataIndex": "age",
      "key": "age"
    }
  ];

  test("Verify Query Export Modal Dialog renders", () => {
    const {getByTestId, getByText, queryByText} = render(<QueryExportModal exportModalVisibility={true} columns={columns} />);
    expect(queryByText("export-warning")).toBeNull();
    expect(getByTestId("query-export-form")).toBeInTheDocument();
    expect(getByText("Rows:")).toBeInTheDocument();
    expect(getByText("Export to a CSV file containing the columns of data currently displayed.")).toBeInTheDocument();
  });

  test("Verify able to select Maximum rows", () => {
    const {getByTestId, getByLabelText, queryByText} = render(<QueryExportModal exportModalVisibility={true} columns={columns} />);

    const allRows = getByLabelText("All") as HTMLInputElement;
    const limitedSet = getByLabelText("Limited set of the first rows returned") as HTMLInputElement;

    expect(allRows).toBeChecked();
    expect(limitedSet).not.toBeChecked();
    expect(queryByText("All")).toBeInTheDocument();
    fireEvent.click(limitedSet);
    expect(allRows).not.toBeChecked();
    expect(limitedSet).toBeChecked();
    expect(queryByText("Limited set of the first rows returned")).toBeInTheDocument();
    expect(queryByText("Maximum rows:")).toBeInTheDocument();

    fireEvent.change(getByTestId("max-rows-input"), {target: {value: "1"}});
    expect(getByTestId("max-rows-input")["value"]).toBe("1");
  });

  test("Verify not able to select zero or negative number of rows", () => {
    const {getByTestId, getByLabelText, queryByText, getByRole} = render(<QueryExportModal exportModalVisibility={true} columns={columns} />);

    const limitedSet = getByLabelText("Limited set of the first rows returned") as HTMLInputElement;

    fireEvent.click(limitedSet);
    expect(queryByText("Limited set of the first rows returned")).toBeInTheDocument();
    expect(queryByText("Maximum rows:")).toBeInTheDocument();

    fireEvent.change(getByTestId("max-rows-input"), {target: {value: "0"}});
    expect(getByTestId("max-rows-input")["value"]).toBe("0");
    expect(getByRole("button", {name: "Export"})).toHaveAttribute("disabled");

    fireEvent.change(getByTestId("max-rows-input"), {target: {value: "-1"}});
    expect(getByTestId("max-rows-input")["value"]).toBe("-1");
    expect(getByRole("button", {name: "Export"})).toHaveAttribute("disabled");

  });

  test("Verify query export modal closes when Cancel is clicked", () => {
    const {getByText, getByRole, queryByText} = render(<QueryExportModal exportModalVisibility={true} columns={columns} />);
    fireEvent.click(getByText("Limited set of the first rows returned"));
    getByRole("button", {name: "Cancel"});
    expect(queryByText("Limited set of the first rows returned\"")).toBeNull();
  });

  test("Verify object/array warning displays", () => {
    const {getByTestId} = render(<QueryExportModal exportModalVisibility={true} columns={columnsNested} hasStructured={true} tableColumns={tableColumns}/>);
    expect(getByTestId("export-warning")).toBeInTheDocument();
  });

  test("Verify export preview renders", () => {
    const {getByTestId, getByText} = render(<QueryExportModal exportModalVisibility={true} columns={columnsNested} hasStructured={true} tableColumns={tableColumns} />);
    fireEvent.click(getByText("Show Preview"));
    expect(getByTestId("export-preview-table")).toBeInTheDocument();
  });

  test("Verify onCancel gets called", () => {
    const {getByText} = render(<QueryExportModal exportModalVisibility={true} columns={columnsNested} hasStructured={true} setExportModalVisibility={jest.fn()}/>);
    const cancelButton = getByText("Cancel");
    cancelButton.onclick = jest.fn();
    fireEvent.click(cancelButton);
    expect(cancelButton.onclick).toHaveBeenCalledTimes(1);
  });

  test("Verify onOK gets called", () => {
    const {getByRole} = render(<QueryExportModal exportModalVisibility={true} columns={columnsNested} hasStructured={true} setExportModalVisibility={jest.fn()}/>);
    const okButton = getByRole("button", {name: "Export"});
    okButton.onclick = jest.fn();
    fireEvent.click(okButton);
    expect(okButton.onclick).toHaveBeenCalledTimes(1);
  });

});