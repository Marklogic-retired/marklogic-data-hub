import React, {useState} from "react";
import styles from "./table-view.module.scss";
import {HCTable} from "@components/common";

interface Props {
  document: any;
  contentType: string;
  location: {};
  isEntityInstance: boolean;
}

const TableView: React.FC<Props> = (props) => {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  let data: any[] = [];
  let counter = 0;
  let expandRow: number[] = [];
  let currRow: number[] = [];


  const parseJson = (obj: Object) => {
    let parsedData: any[] = [];
    for (let i in obj) {
      if (props.location && JSON.stringify(props.location) === JSON.stringify(obj[i])) {
        expandRow = currRow.concat(expandRow);
        expandRow.push(counter);
      }
      if (obj[i] !== null && typeof (obj[i]) === "object") {
        currRow.push(counter);
        parsedData.push({key: counter++, property: i, children: parseJson(obj[i])});
        currRow.pop();
      } else {
        parsedData.push({key: counter++, property: i, value: typeof obj[i] === "boolean" ? obj[i].toString() : obj[i]});
      }
    }
    return parsedData;
  };

  if (props.document) {
    data = parseJson(props.document);
  }

  const columns = [
    {
      text: "Property",
      title: "Property",
      dataField: "property",
      key: "property",
      width: props.isEntityInstance ? "20%" : "40%",
      formatter: (value) => {
        return <span>{value}</span>;
      }
    },
    {
      text: "Value",
      title: "Value",
      dataField: "value",
      key: "value",
      formatter: (value) => {
        return <span>{value}</span>;
      },
      width: props.isEntityInstance ? "80%" : "60%",
    }
  ];

  const onExpand = (record, expanded) => {
    let newExpandedRows = [...expandedRows];

    if (expanded) {
      if (newExpandedRows.indexOf(record.key) === -1) {
        newExpandedRows.push(record.key);
      }
    } else {
      newExpandedRows = newExpandedRows.filter(row => row !== record.key);
    }

    setExpandedRows(newExpandedRows);
  };

  return (
    <HCTable columns={columns}
      className={props.isEntityInstance ? "document-table-demo" : styles.tableViewNonEntity}
      data={data}
      onExpand={onExpand}
      expandedRowKeys={expandedRows}
      showExpandIndicator={{bordered: true}}
      nestedParams={{headerColumns: columns, iconCellList: [], state: [expandedRows, setExpandedRows]}}
      childrenIndent={true}
      data-cy="document-table"
      rowKey="key"
      showHeader={true}
      baseIndent={25}
    />
  );
};

export default TableView;