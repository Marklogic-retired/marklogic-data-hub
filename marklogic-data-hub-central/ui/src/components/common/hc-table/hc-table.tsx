import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import styles from "./hc-table.module.scss";

interface Props {
  className?: string;
    columns: any;
    data: any;
    showExpandIndicator?: boolean;
    rowKey?: string;
    pagination?: boolean | any;
    showHeader?: boolean;
    expandedRowKeys?: number[];
    rowClassName?: string | ((record: any) => string);
    expandedRowRender?: (record: any) => string | React.ReactNode;
    onExpand?: (record: any, expanded: boolean, rowIndex?: number) => void;
}

function HCTable({rowKey, data, expandedRowKeys, showExpandIndicator = false, rowClassName, onExpand, expandedRowRender, ...props}: Props): JSX.Element {
  const expandConfig = {
    className: rowClassName, 
    expanded: expandedRowKeys, 
    showExpandColumn: showExpandIndicator, // Check
    onExpand, 
    renderer: expandedRowRender,
  };
  
  return (
    <BootstrapTable
      keyField={rowKey}
      data={data}
      expandRow={expandConfig}
      {...props}
    />
  );
}

export default HCTable;