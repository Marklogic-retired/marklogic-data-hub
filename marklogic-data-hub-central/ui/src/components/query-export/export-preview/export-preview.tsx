import React from "react";
import {Tooltip} from "antd";

export const getExportPreview = (response) => {
  const tableColumns: Object[] = [];
  const tableData: Object[] = [];
  if (response) {
    response.split("\n").forEach((row, index) => {
      if (index === 0) {
        let header = response.split("\n")[0].split(",");
        header.forEach(e => {
          let prop = e.split(".")[e.split(".").length - 1];
          tableColumns.push(
            {
              title: prop,
              dataIndex: prop,
              key: prop,
              width: 180,
              onCell: () => {
                return {
                  style: {
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"}
                };
              },
              render: (text) => <Tooltip title={text}>{text}</Tooltip>
            }
          );
        });
      } else {
        let i = 0;
        let rowObject: { [c: string]: any } = {key: index};
        let splittedRow = row.split(",");
        tableColumns.forEach(col => {
          rowObject[col["dataIndex"]] = splittedRow[i++];
        });

        tableData.push(rowObject);
      }
    });
  }
  return [tableColumns, tableData];
};
