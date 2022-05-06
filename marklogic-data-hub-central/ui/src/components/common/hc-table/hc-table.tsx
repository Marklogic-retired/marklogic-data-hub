import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import {DropdownButton, Dropdown, FormCheck} from "react-bootstrap";
import {CaretDownFill, CaretUpFill, ChevronDown, ChevronRight} from "react-bootstrap-icons";
import styles from "./hc-table.module.scss";
import "./hc-table.scss";
import HCButton from "../hc-button/hc-button";

interface Props {
  bordered?: boolean;
  childrenIndent?: boolean;
  className?: string;
  columns: any;
  data: any;
  dynamicSortColumns?: boolean;
  rowStyle?: any;
  expandedRowKeys?: number[] | string[];
  expandedContainerClassName?: string | ((record: any) => string);
  key?: string;
  nestedParams?: any;
  showExpandIndicator?: boolean | {bordered?: boolean};
  showHeader?: boolean;
  sort?: {dataField: string, order: string};
  pagination?: boolean | any;
  rowClassName?: string | ((record: any) => string);
  rowKey?: string | ((record: any) => string);
  rowSelection?: any;
  subTableHeader?: boolean;
  keyUtil?: any;
  baseIndent?: number;
  component?: string;
  expandedRowRender?: (record: any, rowIndex?: number) => string | React.ReactNode;
  onExpand?: (record: any, expanded: boolean, rowIndex?: number) => void;
  onTableChange?: (type: string, newState: any) => void;
  rowEvents?: any;
}

function HCTable({className, rowStyle, childrenIndent, data, keyUtil, component, expandedRowKeys, nestedParams, pagination, rowClassName, baseIndent = 0, showHeader = true, showExpandIndicator = false, onExpand, expandedRowRender, ...props}: Props): JSX.Element {
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
    nonExpandable: !props.subTableHeader && !childrenIndent ? [] : data.filter(row => typeof props.rowKey === "string" && !row.children).map(element => typeof props.rowKey === "string" && typeof element[props.rowKey] !== undefined && element[props.rowKey]),
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
  const selectRow = props.rowSelection ? {
    mode: "checkbox",
    clickToSelect: false,
    selectionRenderer: ({mode, checked, disabled, rowKey, rowIndex, record, childrenIndent}) => {
      let renderedRow = record;

      if (!record) {
        if (typeof props.rowKey === "string") {
          renderedRow = data.find(row => row[(props.rowKey as string)] === rowKey);
        } else {
          renderedRow = data[rowIndex];
        }
      }

      return renderedRow && renderedRow.hasChildren ? "" : <FormCheck>
        <FormCheck.Input type="checkbox" checked={checked} disabled={disabled} name={renderedRow[props.rowKey as string]} data-testid={`${renderedRow[props.rowKey as string]}-checkbox`} onChange={(e) => {
          if (childrenIndent) {
            selectRow.onSelect(renderedRow, !checked);
          }
        }} />
      </FormCheck>;
    },
    selectColumnStyle: ({rowKey, rowIndex, record}) => {
      let renderedRow = record;

      if (!record) {
        if (typeof props.rowKey === "string") {
          renderedRow = data.find(row => row[(props.rowKey as string)] === rowKey);
        } else {
          renderedRow = data[rowIndex];
        }
      }

      const styleObject: any = {
        textAlign: "center",
        verticalAlign: "middle",
      };

      if (renderedRow.hasOwnProperty("structured") && renderedRow.structured !== "" && renderedRow.hasChildren) {
        styleObject.display = "none";
      }

      return styleObject;
    },
    ...props.rowSelection,
  } : undefined;

  if (childrenIndent && !expandedRowRender) {
    if (!nestedParams || !nestedParams.state) {
      console.error("Nested expand/collapse requires a `nestedParams` prop with the {headerColumns, state} structure");
    }

    expandConfig.renderer = (row, rowIndex) => renderNested({row, data, keyUtil, component, baseIndent, showHeader, indentList, rowIndex, expandIndicatorStyle: showExpandIndicator, selectRow, rowKey: props.rowKey, ...nestedParams});
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

    options.prePageTitle = "Previous Page";
    options.nextPageTitle = "Next Page";
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

      if (props.onTableChange && defaultSorted.length > 0 && props.dynamicSortColumns) {
        props.sort = {...defaultSorted[0]};
      }
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
            props.onTableChange("sort", {columnKey: field, order});
          }
        };
      } else {
        column.onSort = (field, order) => {
          if (props.onTableChange) {
            props.onTableChange("sort", {columnKey: field, order});
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

  const rowClasses = (row, rowIndex) => {
    let classes;
    if (rowClassName === "mappingSettingRow") {
      if (row.name === "URI" || row.name === "Context") {
        classes = "mappingSettingRow";
      }
    } else {
      classes = `hc-table_row ${rowClassName || ""}`;
    }
    return classes;
  };

  return (
    <BootstrapTable
      id={showHeader ? "mainTable" : "subTable"}
      key={props.key}
      keyField={props.rowKey}
      bordered={false}
      data={data}
      rowStyle={rowStyle}
      defaultSortDirection="asc"
      defaultSorted={defaultSorted}
      expandRow={expandConfig}
      filter={filterFactoryObject}
      noDataIndication={noDataIndication}
      pagination={paginationFactoryObject}
      rowClasses={rowClasses}
      selectRow={selectRow}
      wrapperClasses={props.subTableHeader ? `${className || ""} sub-table` : className || ""}
      rowEvents={ props.rowEvents }
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
const renderRow = ({row, rowIndex, parentRowIndex, keyUtil, component, indentList, baseIndent, headerColumns, showHeader, iconCellList, state, showIndicator, isExpanded, bordered, selectRow, rowKey}) => {
  const [expandedNestedRows] = state;
  const nextColumnHasStaticWidth = headerColumns[0].width && !`${headerColumns[0].width}`.includes("%");
  const selected = selectRow && selectRow.selected;

  let expandKey = keyUtil === "rowKey" ? row.rowKey : row.key;
  let expandIcon = row.children ? <span style={{marginRight: "10px"}} onClick={() => { isExpanded(expandKey); }}>{expandedNestedRows.includes(expandKey) ? <ChevronDown data-testid={`${expandKey}-expand-icon`} /> : <ChevronRight data-testid={`${expandKey}-expand-icon`} />}</span> : null;
  let indentation = 0;
  if (indentList[expandKey]) {
    indentation = indentList[expandKey];
    if (indentation > 2) {
      baseIndent *= isEntityMapping(keyUtil, showHeader) ? 0.65 : 1;
    } else {
      baseIndent *= 1.2;
    }
  }

  //temp fix for mapping tables after merge conflicts
  if (isMapping(keyUtil)) {
    indentation -= 0.8;
  } else if (isEntityMapping(keyUtil, showHeader)) {
    //entity map tables case
    indentation -= 1.6;
  }

  let leftIndent = expandIcon ? indentation * baseIndent - 23 : indentation * baseIndent;

  const isKeyColumn = (colIndex) => colIndex === 0;
  const dataRowKey = typeof row[rowKey] === "string" && row[rowKey].includes(".") ? row[rowKey] : expandKey;

  const indicatorContent = showIndicator ?
    <div key={`indicator_${expandKey}`} className={styles.childrenIndentIndicatorCell}></div>:
    <div className={nextColumnHasStaticWidth ? styles.childrenIndentIndicatorCell : styles.childrenIndentIndicatorEmptyCell}></div>;

  return <div key={expandKey} className={`${isEntityMapping(keyUtil, showHeader) ? styles.childrenIndentTableRowColored : styles.childrenIndentTableRow} hc-table_row`} data-row-key={dataRowKey}>
    {["property", "explore", "ruleset-multiple-modal", "mapping-step-detail"].includes(component) ? indicatorContent : null}
    {selectRow ?
      <div style={{...selectRow.selectColumnStyle({record: row})}} className={styles.childrenIndentSelectCell}>
        {selectRow.selectionRenderer && selectRow.selectionRenderer({disabled: false, record: row, childrenIndent: true, checked: row[rowKey] !== undefined && selected.includes(row[rowKey])})}
      </div> : null
    }
    {headerColumns.map((col, colIndex) => {
      const hasIconCell = iconCellList?.lastIndexOf(col.dataField) !== -1;
      const childElement = col.formatter ? col.formatter(row[col.dataField], row, rowIndex, col.formatExtraData) : row[col.dataField];
      return isKeyColumn(colIndex) ?
        <div
          key={`${col.dataField}-${colIndex}`}
          className={styles.childrenIndentElementCell}
          style={{
            padding: hasIconCell ? `12px 12px 12px ${leftIndent}px` : `16px 16px 16px ${leftIndent}px`,
            width: component === "mapping-step-detail" ? col.width : (isMapping(keyUtil) ? col.width - 90 : col.width || "auto")
          }}
        >
          {!["property", "explore", "ruleset-multiple-modal", "mapping-step-detail"].includes(component) ? indicatorContent : null}
          {isKeyColumn(colIndex) && expandIcon ?
            <div className={styles.childrenTextContainer}>
              {isKeyColumn(colIndex) ? expandIcon : null}
              <span style={{whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", lineHeight: "normal", maxWidth: isMapping(keyUtil) ? `${col.width - indentation*baseIndent}px` : component === "explore" ? `${500 - indentation*baseIndent}px` : component === "property" ? `${480 - indentation*baseIndent}px` : `${165 - indentation*baseIndent}px`}}>{childElement}</span>
            </div> : <span style={{whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", lineHeight: "normal", maxWidth: isMapping(keyUtil) ? `${col.width - indentation*baseIndent}px` : component === "explore" ?`${500 - indentation*baseIndent}px` : component === "property" ? `${480 - indentation*baseIndent}px` : `${165 - indentation*baseIndent}px`}}>{childElement}</span>}
        </div>
        : <div key={`${col.dataField}-${colIndex}`} className={styles.childrenIndentElementCell} style={{padding: `16px`, width: col.width || "auto"}}>
          {childElement}
        </div>;
    })}</div>;
};

const renderNested = ({row, parentRowIndex, keyUtil, component, baseIndent, indentList, headerColumns, showHeader, iconCellList, state, expandIndicatorStyle, selectRow, rowKey}) => {
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
      let tableRow = renderRow({row: currentRow, rowIndex, parentRowIndex, keyUtil, component, baseIndent, indentList, headerColumns, showHeader, iconCellList, state, showIndicator: currentRow.children, isExpanded, bordered, selectRow, rowKey});
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