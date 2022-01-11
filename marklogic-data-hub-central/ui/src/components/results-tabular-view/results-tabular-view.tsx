import React, {useContext, useState, useEffect} from "react";
import QueryExport from "../query-export/query-export";
import {AuthoritiesContext} from "../../util/authorities";
import styles from "./results-tabular-view.module.scss";
import ColumnSelector from "../../components/column-selector/column-selector";
import {SearchContext} from "../../util/search-context";
import {Link} from "react-router-dom";
import {faExternalLinkAlt, faCode, faProjectDiagram} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {dateConverter} from "../../util/date-conversion";
import {HCTooltip, HCTable} from "@components/common";

/* eslint-disable */
interface Props {
  data: any;
  entityPropertyDefinitions: any[];
  selectedPropertyDefinitions: any[];
  columns: any;
  hasStructured: boolean;
  tableView: boolean;
  entityDefArray: any[];
  database: string;
  handleViewChange: any
}
/* eslint-enable */

const DEFAULT_ALL_ENTITIES_HEADER = [
  {
    text: "Identifier",
    dataField: "identifier",
    key: "0-i",
    visible: true,
    width: 150,
    headerFormatter: (column) => <span className="resultsTableHeaderColumn" >{column.text}</span>,
  },
  {
    text: "Entity Type",
    dataField: "entityName",
    key: "0-1",
    visible: true,
    width: 150,
    headerFormatter: (column) => <span className="resultsTableHeaderColumn" >{column.text}</span>,
  },
  {
    text: "Record Type",
    key: "0-2",
    dataField: "recordType",
    visible: true,
    width: 150,
    headerFormatter: (column) => <span className="resultsTableHeaderColumn" >{column.text}</span>,
  },
  {
    text: "Created",
    dataField: "createdOn",
    key: "0-c",
    visible: true,
    width: 150,
    headerFormatter: (column) => <span className="resultsTableHeaderColumn" >{column.text}</span>,
  },
  {
    text: "Detail View",
    dataField: "detailView",
    key: "0-d",
    visible: true,
    width: 150,
    headerFormatter: (column) => <span className="resultsTableHeaderColumn" >{column.text}</span>,
  }
];

const ResultsTabularView = (props) => {

  const [popoverVisibility, setPopoverVisibility] = useState<boolean>(false);
  const [primaryKey, setPrimaryKey] = useState<string>("");
  const [expandedNestedTableRows, setExpandedNestedTableRows] = useState<string[]>([]);
  const [expandedNestedTableColumn, setExpandedNestedTableColumn] = useState<string[]>([]);

  const {
    searchOptions,
    setSelectedTableProperties,
    setSortOrder,
    setGraphViewOptions,
    setSavedNode
  } = useContext(SearchContext);

  const authorityService = useContext(AuthoritiesContext);
  const canExportQuery = authorityService.canExportEntityInstances();
  let counter = 0;

  let selectedTableColumns = props.selectedPropertyDefinitions;

  const generateTableDataWithSelectedColumns = (item, dataObj = {}) => {
    if (item) {
      for (let subItem of item) {
        if (!Array.isArray(subItem)) {
          if (!subItem.hasOwnProperty("properties")) {
            dataObj[subItem.propertyPath] = "";
          } else {
            let dataObjArr: any[] = [];
            if (subItem.properties) {
              dataObjArr.push(generateTableDataWithSelectedColumns(subItem.properties));
            }

            dataObj[subItem.propertyPath] = dataObjArr;
          }
        } else {
          return generateTableDataWithSelectedColumns(subItem);
        }
      }
      return dataObj;
    }
  };

  let dataWithSelectedTableColumns = generateTableDataWithSelectedColumns(props.selectedPropertyDefinitions);


  const handleSubHeaderClick = (key) => {
    if (expandedNestedTableColumn.includes(key)) {
      const filterExpandedColumn = expandedNestedTableColumn.filter(e => e !== key);
      setExpandedNestedTableColumn([...filterExpandedColumn]);
    } else {
      setExpandedNestedTableColumn([...expandedNestedTableColumn, key]);
    }
  };

  const renderStructuredProperty = (properties, cell) => {
    let dataToRender = cell.map((item, indicator) => {
      const row = properties.map((property, index) => {
        const {propertyPath} = property;
        if (!property.hasOwnProperty("properties")) {
          return (
            <td key={index}>
              <div className={styles.columData} key={`${index}`}>{item[propertyPath]}</div>
            </td>
          );
        }
        if (expandedNestedTableColumn.includes(property.propertyPath)) {
          return (
            <td className={styles.innerTableContainer} key={`table${propertyPath}`}>
              {
                renderStructuredProperty(property.properties, item[propertyPath])
              }
            </td>
          );
        }
        return (<td key={`${property.propertyPath}-${index}`} className={styles.nestedColumn}>
          {
            property?.properties?.map((col, index) => <HCTooltip
              key={col.propertyPath}
              text={col.propertyLabel}
              id={`title-tooltip-${indicator}-${index}`}
              placement="top">
              <div style={{textOverflow: "ellipsis", overflow: "hidden"}}>{col.propertyLabel}</div>
            </HCTooltip>)
          }
        </td>);
      });
      return (
        <tr key={indicator}>
          {row}
        </tr>
      );
    });

    const render = (
      <table key={`table-${Math.random()}`} className={styles.innerColumnTable}>
        <thead>
          <tr>
            {
              properties?.map((col, index) => {
                const canClick = col.hasOwnProperty("properties");
                return (<th key={col.propertyPath}>
                  {
                    <HCTooltip
                      text={col.propertyLabel}
                      id={`title-tooltip-${index}`}
                      placement="top">
                      {canClick ? <div className={styles.columHeaderClicked} onClick={() => { handleSubHeaderClick(col.propertyPath); }}>{col.propertyLabel}</div> : <div className={styles.columHeader}>{col.propertyLabel}</div>}
                    </HCTooltip>
                  }
                </th>);
              })
            }
          </tr>
        </thead>
        <tbody>
          {
            dataToRender.length !== 0 ? dataToRender : <tr>{
              properties?.map((col, index) => <td key={`${col?.propertyPath}-${index}`} className={styles.noData}></td>)
            }</tr>
          }
        </tbody>
      </table>
    );


    return render;
  };

  let sortingOrder = false;
  const tableHeaderRender = (selectedTableColumns) => {
    const columns = selectedTableColumns.map((item) => {
      if (item.hasOwnProperty("properties")) {
        return {
          dataField: item.propertyPath,
          key: item.propertyPath,
          text: item.propertyLabel,
          headerEvents: {
            onClick: (_, column) => {
              const {key} = column;
              handleSubHeaderClick(key);
            }
          },
          className: "nestedColumn",
          formatExtraData: {
            key: item.propertyPath,
            properties: item.properties
          },
          headerStyle: {
            cursor: "pointer"
          },
          headerFormatter: (_, $, {sortElement}) => <><span className="resultsTableHeaderColumn" data-testid={`resultsTableColumn-${item.propertyLabel}`}>{item.propertyLabel}</span>{sortElement}</>,
          formatter: (cell, row, colIndex, formatExtraData) => {
            const {key, properties} = formatExtraData;
            if (expandedNestedTableColumn.includes(key)) {
              return renderStructuredProperty(properties, cell);
            } else {
              return (properties?.map((col, index) => <HCTooltip
                key={col.propertyPath}
                text={col.propertyLabel}
                id={`title-tooltip-${index}`}
                placement="top">
                <div style={{textOverflow: "ellipsis", overflow: "hidden"}}>{col.propertyLabel}</div>
              </HCTooltip>));
            }
          },
          onCell: () => {
            return {
              style: {
                whiteSpace: "nowrap",
                maxWidth: 150,
              }
            };
          },
          ...setSortOptions(item),
        };
      } else {
        return {
          dataField: item.propertyPath,
          key: item.propertyPath,
          text: item.propertyLabel,
          headerFormatter: (_, $, {sortElement}) => <><span className="resultsTableHeaderColumn" data-testid={`resultsTableColumn-${item.propertyLabel}`}>{item.propertyLabel}</span>{sortElement}</>,
          ...setSortOptions(item),
          formatter: (value) => {
            if (!Array.isArray(value)) return (<div>{value}</div>);
            return (value?.map((el, index) => <HCTooltip
              key={el}
              text={el}
              id={`title-tooltip-${index}`}
              placement="top">
              <div style={{textOverflow: "ellipsis", overflow: "hidden"}}>{el}</div>
            </HCTooltip>));
          }
        };
      }
    });
    return columns;
  };

  const handleChange = (type, sorter: {columnKey: string; order: string}) => {
    if (searchOptions.sortOrder.length && searchOptions.sortOrder[0].sortDirection === "descending") { setSortOrder(searchOptions.sortOrder[0].propertyName, null); }
  };

  const setSortOptions = (item) => (
    item.sortable ?
      {
        sort: true,
        onSort: (field: any, sortOrder) => {
          if (!sortingOrder) {
            setSortOrder(item.propertyLabel, sortOrder === "asc" ? "ascend" : "descend");
            sortingOrder = true;
          }
        },
        defaultSortOrder: (searchOptions.sortOrder.length && (searchOptions.sortOrder[0].propertyName === item.propertyLabel)
          && searchOptions.sortOrder[0].hasOwnProperty("sortDirection")) ? (searchOptions.sortOrder[0].sortDirection === "ascending") ? "asc" : "desc" : null,
      } : "");

  const updatedTableHeader = () => {
    let header = tableHeaderRender(selectedTableColumns);
    let detailView = {
      table: "Detail View",
      text: "Detail View",
      dataField: "detailView",
      key: "0-d",
      headerFormatter: (column) => <span className="resultsTableHeaderColumn" >{column.text}</span>,
    };
    header.length > 0 && header.push(detailView);
    return header;
  };

  const navigateToGraphView = (item) => {
    setSavedNode(item);
    let primaryKeyValue = item.primaryKey?.propertyValue;
    setGraphViewOptions(`${item.entityName}-${primaryKeyValue}`);
    props.handleViewChange("graph");
  };


  const tableHeaders = props.selectedEntities?.length === 0 ? DEFAULT_ALL_ENTITIES_HEADER : updatedTableHeader();

  const tableDataRender = (item) => {
    let dataObj = {};
    let primaryKeyValue = item.primaryKey?.propertyValue;
    let isUri = item.primaryKey?.propertyPath === "uri";
    let path = {
      pathname: "/tiles/explore/detail",
      primaryKey: isUri ? "" : primaryKeyValue
    };
    let options = {};
    let detailView =
      <div className={styles.redirectIcons}>
        <Link to={{
          pathname: `${path.pathname}`, state: {
            selectedValue: "instance",
            entity: searchOptions.entityTypeIds,
            pageNumber: searchOptions.pageNumber,
            start: searchOptions.start,
            searchFacets: searchOptions.selectedFacets,
            query: searchOptions.query,
            tableView: props.tableView,
            sortOrder: searchOptions.sortOrder,
            sources: item.sources,
            primaryKey: path.primaryKey,
            uri: item.uri,
            entityInstance: item.entityInstance,
            targetDatabase: searchOptions.database
          }
        }} id={"instance"}
        data-cy="instance">
          <HCTooltip text="Show the processed data" id="processed-data-tooltip" placement="top-end">
            <i><FontAwesomeIcon className={styles.iconHover} icon={faExternalLinkAlt} size="sm" data-testid={`${primaryKeyValue}-detailOnSeparatePage`} /></i>
          </HCTooltip>
        </Link>
        <Link to={{
          pathname: `${path.pathname}`,
          state: {
            selectedValue: "source",
            entity: searchOptions.entityTypeIds,
            pageNumber: searchOptions.pageNumber,
            start: searchOptions.start,
            searchFacets: searchOptions.selectedFacets,
            query: searchOptions.query,
            tableView: props.tableView,
            sortOrder: searchOptions.sortOrder,
            sources: item.sources,
            primaryKey: path.primaryKey,
            uri: item.uri,
            entityInstance: item.entityInstance,
            targetDatabase: searchOptions.database
          }
        }} id={"source"}
        data-cy="source">
          <HCTooltip text={"Show the complete " + item.format.toUpperCase()} id="show-json-tooltip" placement="top-end">
            {item.format.toUpperCase() !== "XML" ?
              <i><FontAwesomeIcon className={styles.iconHover} icon={faCode} size="sm" data-testid={`${primaryKeyValue}-sourceOnSeparatePage`} /></i>
              :
              <span className={styles.jsonIcon} data-testid={`${primaryKeyValue}-sourceOnSeparatePage`}></span>
            }
          </HCTooltip>
        </Link>
        <div className={styles.graphIcon}>
          <HCTooltip text={"View entity in graph view"} id="show-table-graph" placement="top-end">
            <i><FontAwesomeIcon className={styles.iconHover} icon={faProjectDiagram}
              size="sm" data-testid={`${primaryKeyValue}-graphOnSeparatePage`} onClick={() => navigateToGraphView(item)} /></i>
          </HCTooltip>
        </div>
      </div>;
    if (props.selectedEntities?.length === 0 && item.hasOwnProperty("entityName")) {
      let itemIdentifier = item.identifier?.propertyValue;
      let itemEntityName = item.entityName;
      let document = item.uri.split("/")[item.uri.split("/").length - 1];
      let createdOn = item.createdOn;
      const identifierCell = isUri ? <HCTooltip text={item.uri} id={itemIdentifier + "-tooltip"} placement="top"><span>".../" + {document}</span></HCTooltip> : itemIdentifier;
      options = {
        primaryKey: primaryKeyValue,
        identifier: identifierCell,
        entityName: <span data-testid={`${itemEntityName}-${primaryKeyValue}`}>{itemEntityName}</span>,
        recordType: <span data-testid={`${item.format}-${primaryKeyValue}`}>{item.format}</span>,
        createdOn: dateConverter(createdOn),
        uri: item.uri,
        primaryKeyPath: path,
        sources: item.sources,
        entityInstance: item.entityInstance,
        detailView: detailView,
        database: searchOptions.database
      };
    } else {
      options = {
        primaryKey: primaryKeyValue,
        uri: item.uri,
        primaryKeyPath: path,
        sources: item.sources,
        entityInstance: item.entityInstance,
        detailView: detailView,
        database: searchOptions.database
      };
    }
    dataObj = {...dataObj, ...options};
    if (item?.hasOwnProperty("entityProperties")) {
      if (JSON.stringify(item.entityProperties) !== JSON.stringify([])) {
        generateTableData(item.entityProperties, dataObj);
      } else {
        dataObj = {...dataObj, ...dataWithSelectedTableColumns};
      }
    }

    return dataObj;
  };

  const generateTableData = (item, dataObj = {}) => {
    if (item) {
      for (let subItem of item) {
        if (!Array.isArray(subItem)) {
          if (!Array.isArray(subItem.propertyValue) || subItem.propertyValue[0] === null || typeof (subItem.propertyValue[0]) !== "object") {
            dataObj[subItem.propertyPath] = subItem.propertyValue;
          } else {
            let dataObjArr: any[] = [];
            subItem.propertyValue.forEach((el, index) => {
              if (el) {
                dataObjArr.push(generateTableData(el, {key: index}));
              }
            });
            dataObj[subItem.propertyPath] = dataObjArr;
          }
        } else {
          return generateTableData(subItem);
        }
      }
      return dataObj;
    }
  };

  const dataSource = props.data.map((item) => {
    return tableDataRender(item);
  })
    ;

  useEffect(() => {
    if (props.columns && props.columns.length > 0 && searchOptions.selectedTableProperties.length === 0) {
      setSelectedTableProperties(props.columns);
    }
  }, [props.columns]);

  useEffect(() => {
    props.selectedEntities && props.selectedEntities.length && props.entityDefArray && props.entityDefArray.forEach((entity => {
      if (entity.name === props.selectedEntities[0]) {
        entity.primaryKey && setPrimaryKey(entity.primaryKey);
      }
      setExpandedNestedTableRows([]);
      setExpandedNestedTableColumn([]);
    }));
  }, [props.selectedEntities, searchOptions.selectedTableProperties]);

  const expandedRowRender = (rowId) => {
    const nestedColumns = [
      {
        text: "Property",
        dataField: "property",
        width: "33%",
        formatter: (_, row) => {
          return <span>{row.property}</span>;
        },
      },
      {
        text: "Value",
        dataField: "value",
        width: "calc(34% - 50px)",
        formatter: (_, row) => {
          return <span>{row.value}</span>;
        },
      },
      {
        text: "View",
        dataField: "view",
        width: "33%",
        formatter: (_, row) => {
          return <span>{row.view}</span>;
        },
      },
    ];

    let nestedData: any[] = [];
    const parseJson = (obj: Object) => {
      let parsedData: any[] = [];
      for (let i in obj) {
        if (obj[i] !== null && typeof (obj[i]) === "object") {
          parsedData.push({
            key: counter++,
            property: i,
            children: parseJson(obj[i]),
            view: <Link to={{
              pathname: `${rowId.primaryKeyPath.pathname}`, state: {
                id: obj[i],
                entity: searchOptions.entityTypeIds,
                pageNumber: searchOptions.pageNumber,
                start: searchOptions.start,
                searchFacets: searchOptions.selectedFacets,
                query: searchOptions.query,
                tableView: props.tableView,
                sortOrder: searchOptions.sortOrder,
                sources: rowId.sources,
                primaryKey: rowId.primaryKeyPath.primaryKey,
                uri: rowId.uri,
                entityInstance: rowId.entityInstance,
                targetDatabase: searchOptions.database
              }
            }}
            data-cy="nested-instance">
              <HCTooltip text="Show nested detail on a separate page" id="show-separate-page-tooltip" placement="top">
                <i><FontAwesomeIcon icon={faExternalLinkAlt} size="sm" /></i>
              </HCTooltip>
            </Link>
          });
        } else {
          parsedData.push({
            key: counter++,
            property: i,
            value: typeof obj[i] === "boolean" ? obj[i].toString() : obj[i],
            view: null
          });
        }
      }
      return parsedData;
    };

    let index: string = "";
    for (let i in props.data) {
      if (props.data[i].uri === rowId.uri) {
        index = i;
      }
    }

    nestedData = parseJson(props.data[index]?.entityInstance);


    const onExpand = (record, expanded) => {
      let newExpandedNestedTableRows = [...expandedNestedTableRows];

      if (expanded) {
        if (newExpandedNestedTableRows.indexOf(record.key) === -1) {
          newExpandedNestedTableRows.push(record.key);
        }
      } else {
        newExpandedNestedTableRows = newExpandedNestedTableRows.filter(row => row !== record.key);
      }

      setExpandedNestedTableRows(newExpandedNestedTableRows);
    };

    return (
      <HCTable
        rowKey="key"
        columns={nestedColumns}
        data={nestedData}
        pagination={false}
        expandedRowKeys={expandedNestedTableRows}
        showExpandIndicator={{bordered: true}}
        nestedParams={{headerColumns: nestedColumns, iconCellList: [], state: [expandedNestedTableRows, setExpandedNestedTableRows]}}
        onExpand={onExpand}
        childrenIndent={true}
        className={`exploreInternalTable`}
        baseIndent={25}
      />
    );
  };

  return (
    <>
      <div className={styles.icon}>
        <div className={styles.queryExport} data-cy="query-export">
          {canExportQuery && searchOptions.entityTypeIds.length > 0 && <QueryExport hasStructured={props.hasStructured} columns={props.columns} selectedPropertyDefinitions={props.selectedPropertyDefinitions} />}
        </div>
        {props.selectedEntities?.length !== 0 ? <div className={styles.columnSelector} data-cy="column-selector">
          <ColumnSelector popoverVisibility={popoverVisibility} setPopoverVisibility={setPopoverVisibility} entityPropertyDefinitions={props.entityPropertyDefinitions} selectedPropertyDefinitions={props.selectedPropertyDefinitions} setColumnSelectorTouched={props.setColumnSelectorTouched} columns={props.columns} primaryKey={primaryKey} />
        </div> : ""}
      </div>
      <div className={styles.tabular}>
        {tableHeaders.length > 0 && <HCTable
          data-testid="result-table"
          rowKey="uri"
          className={`resultTableMain`}
          data={props.isLoading ? [] : dataSource}
          columns={tableHeaders}
          onTableChange={handleChange}
          expandedRowRender={tableHeaders.length > 0 ? expandedRowRender : undefined}
          pagination={false}
          showExpandIndicator={true}
          bordered
          dynamicSortColumns
        />}
      </div>
    </>
  );
};

export default ResultsTabularView;
