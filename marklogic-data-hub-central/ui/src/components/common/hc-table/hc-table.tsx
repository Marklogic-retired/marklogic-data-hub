import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import {DropdownButton, Dropdown} from "react-bootstrap";
import {CaretDownFill, CaretUpFill, ChevronDown, ChevronRight} from "react-bootstrap-icons";
import styles from "./hc-table.module.scss";
import "./hc-table.scss";
import HCButton from "../hc-button/hc-button";

interface Props {
  childrenIndent?: boolean;
  className?: string;
  columns: any;
  data: any;
  rowStyle?: any;
  expandedRowKeys?: number[] | string[];
  expandedContainerClassName?: string | ((record: any) => string);
  key?: string;
  nestedParams?: any;
  showExpandIndicator?: boolean | {bordered?: boolean};
  showHeader?: boolean;
  pagination?: boolean | any;
  rowClassName?: string | ((record: any) => string);
  rowKey?: string | ((record: any) => string);
  subTableHeader?: boolean;
  keyUtil?: any;
  baseIndent?: number;
  expandedRowRender?: (record: any, rowIndex?: number) => string | React.ReactNode;
  onExpand?: (record: any, expanded: boolean, rowIndex?: number) => void;
  onTableChange?: (type: string, newState: any) => void;
}

function HCTable({className, rowStyle, childrenIndent, data, keyUtil, expandedRowKeys, nestedParams, pagination, rowClassName, rowKey, baseIndent = 0, showHeader = true, showExpandIndicator = false, onExpand, expandedRowRender, ...props}: Props): JSX.Element {
  const expandConfig = {
    className: `${showHeader ? styles.expandedRowWrapper : ""} ${props.subTableHeader ? styles.subTableNested : ""} ${childrenIndent ? styles.childrenIndentExpanded : ""}${props.expandedContainerClassName || ""}`,
    expanded: expandedRowKeys,
    showExpandColumn: !!showExpandIndicator,
    expandByColumnOnly: !!showExpandIndicator,
    onExpand,
    renderer: expandedRowRender,
    expandColumnRenderer: ({expanded, rowKey, expandable}) => {
      let bordered;

      if (!expandable || !showHeader) {
        return null;
      }

      if (typeof showExpandIndicator === "object") {
        bordered = showExpandIndicator.bordered;
      }

      return <HCButton data-testid={`${rowKey}-expand-icon`} aria-label="Expand row" variant="outline-light" className={`${styles.expandButtonIndicator} ${bordered ? styles.borderedIndicator : ""}`}>
        {expanded ?
          <ChevronDown className={styles.iconIndicator} aria-label="down" /> :
          <ChevronRight className={styles.iconIndicator} aria-label="right" />}
      </HCButton>;
    },
    expandHeaderColumnRenderer: () => "",
    nonExpandable: !props.subTableHeader && !childrenIndent ? [] : data.filter(row => typeof rowKey === "string" && !row.children).map(element => typeof rowKey === "string" && typeof element[rowKey] !== undefined && element[rowKey]),
  };

  const generateIndentList = (data, indentLevel, indentArray) => {
    data.map(row => {
      let expandKey = keyUtil === "rowKey" ? row.rowKey : row.key;
      indentArray[expandKey] = indentLevel;
      if (row.children) {
        generateIndentList(row.children, indentLevel + 1, indentArray);
      }
    });
    return indentArray;
  };

  let indentList: any = [];
  indentList = generateIndentList(data, 1, indentList);

  //expandedRowRender used on basic tables with no nesting such as entity-type-table, else below is called
  if (childrenIndent && !expandedRowRender) {
    if (!nestedParams || !nestedParams.state) {
      console.error("Nested expand/collapse requires a `nestedParams` prop with the {headerColumns, state} structure");
    }

    expandConfig.renderer = (row, rowIndex) => renderNested({row, data, keyUtil, baseIndent, showHeader, indentList, rowIndex, expandIndicatorStyle: showExpandIndicator, ...nestedParams});
  }

  const defaultSorted: Array<{dataField: string; order: string;}> = []; // expects { dataField: string; order: string; }
  const noDataIndication = () => <div className={styles.noDataPlaceholder}><span>No Data</span></div>;
  let paginationFactoryObject = null;
  let filterFactoryObject = null;

  if (pagination) {
    const options: any = {
      alwaysShowAllBtns: true,
      withFirstAndLast: true,
    };

    if (pagination.hideOnSinglePage) { // ToDo: fix
      options.hidePageListOnlyOnePage = pagination.hideOnSinglePage;
    }

    if (pagination.showSizeChanger) {
      if (pagination.pageSizeOptions) {
        options.sizePerPageList = pagination.pageSizeOptions.map(pageSize => {
          return {
            text: `${pageSize} / page`,
            value: +pageSize,
          };
        });
      }

      if (pagination.onShowSizeChange) {
        options.onSizePerPageChange = pagination.onShowSizeChange;
      }

      options.sizePerPageRenderer = ({options, currSizePerPage, onSizePerPageChange}) => (
        <div className="test">
          <DropdownButton
            variant="outline-light"
            aria-label="size-per-page"
            id="size-per-page"
            align="end"
            className="sizePageSelector"
            title={`${currSizePerPage} / page`}
            onSelect={onSizePerPageChange}>
            {options.map(option => {
              return <Dropdown.Item key={`${option.page}`} eventKey={`${option.page}`} className={`${+option.page === +currSizePerPage ? "item-active" : ""}`}>
                <span aria-label={`${option.text}`}>{option.text}</span>
              </Dropdown.Item>;
            })}
          </DropdownButton>
        </div>
      );
    } else {
      options.hideSizePerPage = true;
    }

    if (pagination.onChange) {
      options.onPageChange = pagination.onChange;
    }

    if (pagination.pageSize) {
      options.sizePerPage = pagination.pageSize;
    }

    if (pagination.current) {
      options.page = pagination.current;
    }

    if (pagination.defaultCurrent) {
      options.pageStartIndex = pagination.defaultCurrent;
    }

    paginationFactoryObject = paginationFactory(options);
  }

  props.columns.forEach(column => {
    if (!column.key) {
      column.key = column.dataField;
    }

    column.classes = isMapping(keyUtil) && isMappingXML(showHeader) ? styles.tableCellXML : styles.tableCell;

    if (column.className) {
      column.classes += ` ${column.className}`;
    }

    column.headerClasses = styles.header;

    if (props.subTableHeader) {
      column.headerClasses += ` ${styles.subTableHeader}`;
    }

    if (childrenIndent) {
      column.headerClasses += ` ${styles.childrenIndentHeader}`;
    }

    if (expandedRowRender) {
      column.headerClasses += isMapping(keyUtil) && isMappingXML(showHeader) ? ` ${styles.hasExpandedRowXML}` : ` ${styles.hasExpandedRow}`;
    }

    if (column.defaultSortOrder) {
      defaultSorted.push({
        dataField: column.dataField,
        order: column.defaultSortOrder,
      });
    }

    column.sortCaret = (order, _) => {
      let carets = (<><CaretUpFill className={styles.caret} aria-label="icon: caret-up" /><CaretDownFill className={styles.caret} aria-label="icon: caret-down" /></>);

      if (order === "asc") {
        carets = (<><CaretUpFill className={styles.activeCaret} aria-label="icon: caret-up" /><CaretDownFill className={styles.caret} aria-abel="icon: caret-down" /></>);
      } else if (order === "desc") {
        carets = (<><CaretUpFill className={styles.caret} aria-label="icon: caret-up" /><CaretDownFill className={styles.activeCaret} aria-label="icon: caret-down" /></>);
      }
      return <div className={styles.caretContainer}>{carets}</div>;
    };

    if (column.sort) {
      if (column.onSort) {
        const sortDelegate = column.onSort;
        column.onSort = (field, order) => {
          sortDelegate(field, order);
          if (props.onTableChange) {
            props.onTableChange("order", {columnKey: field, order});
          }
        };
      } else {
        column.onSort = (field, order) => {
          if (props.onTableChange) {
            props.onTableChange("order", {columnKey: field, order});
          }
        };
      }
    }

    if (column.customFilter) {
      // const options = {
      //   type: FILTER_TYPES.TEXT,
      //   comparator: Comparator.EQ,
      // };

      // column.filter = customFilter(options);
      // filterFactoryObject = filterFactory();
      // Check DHFPROD-8040 for implementation pointers for column.filterRenderer
    }

    if (column.width && !column.style) {
      column.style = {width: `${column.width}`};
    }

  });

  let rowClasses = `hc-table_row ${rowClassName || ""}`;

  if (props.onTableChange) {
    delete props.onTableChange;
  }

  return (
    <BootstrapTable
      id={showHeader ? "mainTable" : "lowerTable"}
      key={props.key}
      keyField={rowKey}
      bordered={false}
      data={data}
      rowStyle={rowStyle}
      defaultSortDirection="asc"
      defaultSorted={defaultSorted}
      expandRow={expandConfig}
      filter={filterFactoryObject}
      noDataIndication={noDataIndication}
      pagination={paginationFactoryObject}
      rowClasses={rowClassName || rowClasses}
      wrapperClasses={props.subTableHeader ? `${className || ""} sub-table` : className || ""}
      {...props}
    />
  );
}

const isMapping = (keyUtil) => {
  return keyUtil === "rowKey" ? true : false;
};

const isMappingXML = (showHeader) => {
  return !showHeader ? true : false;
};

const isEntityMapping = (keyUtil, showHeader) => {
  return keyUtil === "key" && !showHeader;
};

const renderRow = ({row, rowIndex, parentRowIndex, keyUtil, indentList, baseIndent, headerColumns, showHeader, iconCellList, state, showIndicator, isExpanded, bordered}) => {
  const [expandedNestedRows] = state;
  const nextColumnHasStaticWidth = headerColumns[0].width && !`${headerColumns[0].width}`.includes("%");

  let expandKey = keyUtil === "rowKey" ? row.rowKey : row.key;
  let expandIcon = row.children ? <div onClick={() => { isExpanded(expandKey); }}>{expandedNestedRows.includes(expandKey) ? <ChevronDown data-testid={`${expandKey}-expand-icon`} /> : <ChevronRight data-testid={`${expandKey}-expand-icon`} />}</div> : null;
  let indentation = 0;
  if (indentList[expandKey]) {
    indentation = indentList[expandKey];
    if (indentation > 2) {
      baseIndent *= 0.85;
    }
  }

  //temp fix for mapping tables after merge conflicts
  if (isMapping(keyUtil)) {
    indentation -= isMappingXML(showHeader) ? 1.2 : 2;
  } else if (isEntityMapping(keyUtil, showHeader)) {
    //entity map tables case
    indentation -= 1.6;
  }

  const isKeyColumn = (colIndex) => colIndex === 0;

  return <div key={expandKey} className={`${isEntityMapping(keyUtil, showHeader) ? styles.childrenIndentTableRowColored : styles.childrenIndentTableRow} hc-table_row`} data-row-key={expandKey}>
    {showIndicator ?
      <div key={`indicator_${expandKey}`} className={styles.childrenIndentIndicatorCell}></div>:
      <div className={nextColumnHasStaticWidth ? styles.childrenIndentIndicatorCell : styles.childrenIndentIndicatorEmptyCell}></div>
    }
    {headerColumns.map((col, colIndex) => {
      const hasIconCell = iconCellList?.lastIndexOf(col.dataField) !== -1;
      const childElement = col.formatter ? col.formatter(row[col.dataField], row, rowIndex) : row[col.dataField];
      return isKeyColumn(colIndex) ?
        <div key={col.dataField} className={styles.childrenIndentElementCell} style={{padding: hasIconCell ? `12px 12px 12px ${indentation*baseIndent}px` : `16px 16px 16px ${indentation*baseIndent}px`, width: col.width || "auto"}}>
          {isKeyColumn(colIndex) && expandIcon ?
            <div className={styles.childrenTextContainer}><div>
              {isKeyColumn(colIndex) ? expandIcon : null}</div>
            <div className={styles.childElementText}>{childElement}</div>
            </div> : <div>{childElement}</div>}
        </div>
        : <div key={col.dataField} className={styles.childrenIndentElementCell} style={{padding: hasIconCell ? `12px` : `16px`, width: col.width || "auto"}}>
          {childElement}
        </div>;
    })}</div>;
};

const renderNested = ({row, parentRowIndex, keyUtil, baseIndent, indentList, headerColumns, showHeader, iconCellList, state, expandIndicatorStyle}) => {
  const [expandedNestedRows, setExpandedNestedRows] = state;

  const isExpanded = (key) => {
    const index = expandedNestedRows.indexOf(key);

    if (index === -1) {
      const addedKeys = [...expandedNestedRows, key];
      setExpandedNestedRows(addedKeys);
    } else {
      const removedKeys = [...expandedNestedRows];
      removedKeys.splice(index, 1);
      setExpandedNestedRows(removedKeys);
    }
  };

  let bordered = false;

  if (typeof expandIndicatorStyle === "object") {
    bordered = expandIndicatorStyle.bordered;
  }

  let result: any = [];

  if (row.children) {
    let childrenList: any = [...row.children];
    let rowIndex = 0;

    while (childrenList.length > 0) {
      let currentRow = childrenList.shift();
      let tableRow = renderRow({row: currentRow, rowIndex, parentRowIndex, keyUtil, baseIndent, indentList, headerColumns, showHeader, iconCellList, state, showIndicator: currentRow.children, isExpanded, bordered});
      result.push(tableRow);
      rowIndex = result.length;
      const children = currentRow.children;
      let currentRowKey = keyUtil === "rowKey" ? currentRow.rowKey : currentRow.key;

      if (children && expandedNestedRows.includes(currentRowKey)) {
        childrenList = [...children, ...childrenList];
      }
    }
  }

  return <div className={styles.childrenIndentTableExpanded}>{result}</div>;

};

export default HCTable;