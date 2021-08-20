import React, {useContext, useState, useEffect} from "react";
import QueryExport from "../query-export/query-export";
import {AuthoritiesContext} from "../../util/authorities";
import styles from "./results-tabular-view.module.scss";
import ColumnSelector from "../../components/column-selector/column-selector";
import {Tooltip, Table} from "antd";
import {SearchContext} from "../../util/search-context";
import {Link} from "react-router-dom";
import {faExternalLinkAlt, faCode} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {dateConverter} from "../../util/date-conversion";

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
}
/* eslint-enable */

const DEFAULT_ALL_ENTITIES_HEADER = [
  {
    title: "Identifier",
    dataIndex: "identifier",
    key: "0-i",
    visible: true,
    width: 150
  },
  {
    title: "Entity Type",
    dataIndex: "entityName",
    key: "0-1",
    visible: true,
    width: 150
  },
  {
    title: "Record Type",
    key: "0-2",
    dataIndex: "recordType",
    visible: true,
    width: 150
  },
  {
    title: "Created",
    dataIndex: "createdOn",
    key: "0-c",
    visible: true,
    width: 150
  },
  {
    title: "Detail View",
    dataIndex: "detailView",
    key: "0-d",
    visible: true,
    width: 150
  }
];

const ResultsTabularView = (props) => {

  const [popoverVisibility, setPopoverVisibility] = useState<boolean>(false);
  const [primaryKey, setPrimaryKey] = useState<string>("");

  const {
    searchOptions,
    setSelectedTableProperties,
    setSortOrder
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

  let sortingOrder = false;
  const tableHeaderRender = (selectedTableColumns) => {
    const columns = selectedTableColumns.map((item) => {
      if (!item.hasOwnProperty("properties")) {
        return {
          dataIndex: item.propertyPath,
          key: item.propertyPath,
          title: <span data-testid={`resultsTableColumn-${item.propertyLabel}`}>{item.propertyLabel}</span>,
          type: item.datatype,
          onCell: () => {
            return {
              style: {
                whiteSpace: "nowrap",
                maxWidth: 150,
              }
            };
          },
          ...setSortOptions(item),
          render: (value) => {
            if (Array.isArray(value)) {
              let values : any[] = [];
              value.forEach(item => {
                let val = item === null ? "null" : item === "" ? "\"\"" : item;
                if (val !== undefined) {
                  let title = val.toString();
                  if (title) {
                    values.push(
                      <Tooltip
                        key={title}
                        title={title}>
                        <div style={{textOverflow: "ellipsis", overflow: "hidden"}}>{title}</div>
                      </Tooltip>
                    );
                  }
                }
              });
              return {
                children: values
              };
            } else {
              if (value) {
                return {
                  children: (
                    <Tooltip
                      title={value}>
                      <div style={{textOverflow: "ellipsis", overflow: "hidden"}}>{value}</div>
                    </Tooltip>
                  )
                };
              }
            }
          },
        };
      } else {
        return {
          dataIndex: item.propertyPath,
          key: item.propertyPath,
          title: <span data-testid={`resultsTableColumn-${item.propertyLabel}`}>{item.propertyLabel}</span>,
          type: item.datatype,
          ...setSortOptions(item),
          columns: tableHeaderRender(item.properties)
        };
      }
    });
    return columns;
  };

  const handleChange = (sorter) => {
    if (searchOptions.sortOrder.length && searchOptions.sortOrder[0].sortDirection === "descending") { setSortOrder(searchOptions.sortOrder[0].propertyName, null); }
  };

  const setSortOptions = (item) => (
    item.sortable ?
      {
        sorter: (a: any, b: any, sortOrder) => {
          if (!sortingOrder) {
            setSortOrder(item.propertyLabel, sortOrder);
            sortingOrder = true;
          }
        },
        sortOrder: (searchOptions.sortOrder.length && (searchOptions.sortOrder[0].propertyName === item.propertyLabel)
             && searchOptions.sortOrder[0].hasOwnProperty("sortDirection")) ? (searchOptions.sortOrder[0].sortDirection === "ascending") ?"ascend":"descend" : null,
      } : "");

  const updatedTableHeader = () => {
    let header = tableHeaderRender(selectedTableColumns);
    let detailView = {
      title: "Detail View",
      dataIndex: "detailView",
      key: "0-d"
    };
    header.length > 0 && header.push(detailView);
    return header;
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
                <Tooltip title={"Show the processed data"} placement="topRight"><FontAwesomeIcon className={styles.iconHover} icon={faExternalLinkAlt} size="sm" data-testid={`${primaryKeyValue}-detailOnSeparatePage`} /></Tooltip>
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
                <Tooltip title={"Show the complete " + item.format.toUpperCase()} placement="topRight">
                  {item.format.toUpperCase() === "XML" ?
                    <FontAwesomeIcon className={styles.iconHover} icon={faCode} size="sm" data-testid={`${primaryKeyValue}-sourceOnSeparatePage`} />
                    :
                    <span className={styles.jsonIcon} data-testid={`${primaryKeyValue}-sourceOnSeparatePage`}></span>
                  }
                </Tooltip>
              </Link>
            </div>;
    if (props.selectedEntities?.length === 0 && item.hasOwnProperty("entityName")) {
      let itemIdentifier = item.identifier?.propertyValue;
      let itemEntityName = item.entityName;
      let document = item.uri.split("/")[item.uri.split("/").length - 1];
      let createdOn = item.createdOn;
      options = {
        primaryKey: primaryKeyValue,
        identifier: <Tooltip title={isUri && item.uri}>{isUri ? ".../" + document : itemIdentifier}</Tooltip>,
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
    }));
  }, [props.selectedEntities, searchOptions.selectedTableProperties]);

  const expandedRowRender = (rowId) => {
    const nestedColumns = [
      {title: "Property", dataIndex: "property", width: "33%"},
      {title: "Value", dataIndex: "value", width: "34%"},
      {title: "View", dataIndex: "view", width: "33%"},
    ];

    let nestedData: any[] = [];
    const parseJson = (obj: Object) => {
      let parsedData : any[] = [];
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
              <Tooltip title={"Show nested detail on a separate page"}><FontAwesomeIcon icon={faExternalLinkAlt}
                size="sm" /></Tooltip>
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

    return <Table
      rowKey="key"
      columns={nestedColumns}
      dataSource={nestedData}
      pagination={false}
      className={styles.nestedTable}
    />;
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
        <Table bordered
          data-testid="result-table"
          rowKey="uri"
          dataSource={props.isLoading ? [] : dataSource}
          columns={tableHeaders}
          onChange={handleChange}
          expandedRowRender={tableHeaders.length > 0 ? expandedRowRender : undefined}
          pagination={false}
          // defaultShowEmbeddedTableBodies={true}
          loading={props.isLoading}
        />
      </div>
    </>
  );
};

export default ResultsTabularView;
