import React, {useContext, useState, useEffect} from "react";
import styles from "./job-results-table-view.module.scss";
import {dateConverter} from "../../util/date-conversion";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBan, faColumns} from "@fortawesome/free-solid-svg-icons";
import "./job-results-table-view.scss";
import {MonitorContext} from "@util/monitor-context";
import JobResponse from "../job-response/job-response";
import {CheckCircleFill, ClockFill, XCircleFill, ExclamationCircleFill} from "react-bootstrap-icons";
import {HCButton, HCCheckbox, HCDivider, HCTooltip, HCTable} from "@components/common";
import Popover from "react-bootstrap/Popover";
import {OverlayTrigger} from "react-bootstrap";
import {themeColors} from "@config/themes.config";
import ExpandCollapse from "../../../src/components/expand-collapse/expand-collapse";
import {getViewSettings, setViewSettings} from "@util/user-context";

const JobResultsTableView = ({data}) => {
  const [popoverVisibility, setPopoverVisibility] = useState<boolean>(false);
  const [jobId, setJobId] = useState<string>("");
  const [openJobResponse, setOpenJobResponse] = useState<boolean>(false);
  const [arraybyDistinctJobId, setArraybyDistinctJobId] = useState<any>([]);
  const [orderColumn, setOrderColumn] = useState("");
  const [orderColumnName, setOrderColumnName] = useState("");
  const [flagOrderManual, setFlagOrderManual] = useState(false);
  //const [expandedRowKeys, setExpandedRowKeys] = useState<any[]>([]);

  const handleOpenJobResponse = (jobId) => {
    setJobId(jobId);
    setOpenJobResponse(true);
  };

  const handleCloseJobResponse = (jobId) => {
    setOpenJobResponse(false);
    setJobId("");
  };

  const flowName = "Flow Name";
  const user = "User";

  const {
    setMonitorSortOrder
  } = useContext(MonitorContext);
  let sorting = true;
  const columnOptionsLabel = {
    user: user,
    flowName: flowName,
  };

  const emptyValue = () => {
    return <></>;
  };

  useEffect(() => {
    toggleSourceTable("expand", false);
  }, [orderColumnName, orderColumn]);

  const orderColumns = (field: string, order: string) => {
    setFlagOrderManual(true);
    saveExpandedTableKeys();
    setOrderColumnName(field);
    setOrderColumn(order);
    saveColumnOrder(field, order);
  };

  const MANDATORY_HEADERS = [
    {
      text: "Step Name",
      dataField: "jobId",
      visible: true,
      //width: 320,
      sort: true,
      formatter: (jobId) => {
        return <>
          <HCTooltip text="Click the JOB ID to see the details" id="Click JOB ID to see the details" placement="right">
            <a data-testid={`jobId-link`} onClick={() => handleOpenJobResponse(jobId)}>{jobId}</a>
          </HCTooltip>
        </>;
      },
      sortFunc: (a, b, dataField) => { },
      onSort: (field, order) => {
        orderColumns(field, order);
      }
    },
    // {
    //   text: "Step Name",
    //   dataField: "stepName",
    //   visible: true,
    //   width: 200,
    //   sort: true,
    // },
    {
      text: "Step Type",
      dataField: "stepDefinitionType",
      visible: true,
      //width: 140,
      sort: true,
      formatter: emptyValue,
      sortFunc: (a, b, dataField) => { },
      onSort: (field, order) => {
        orderColumns(field, order);
      }
    },
    {
      text: "Status",
      dataField: "stepStatus",
      visible: true,
      //width: 100,
      sort: true,
      align: "center",
      formatter: emptyValue,
      sortFunc: (a, b, dataField) => { },
      onSort: (field, order) => {
        orderColumns(field, order);
      }
    },
    {
      text: "Entity Type",
      dataField: "entityName",
      visible: true,
      //width: 100,
      sort: true,
      formatter: emptyValue,
      sortFunc: (a, b, dataField) => { },
      onSort: (field, order) => {
        orderColumns(field, order);
      }
    },
    {
      text: "Start Date and Time",
      dataField: "startTime",
      visible: true,
      //width: 150,
      sort: true,
      formatter: emptyValue,
      sortFunc: (a, b, dataField) => { },
      onSort: (field, order) => {
        orderColumns(field, order);
      }
    },
    {
      text: "Duration",
      dataField: "duration",
      visible: true,
      sort: false,
      //width: 100,
      formatter: emptyValue,
    },
    {
      text: "Documents Written",
      dataField: "successfulItemCount",
      visible: true,
      //width: 150,
      sort: false,
      align: "right",
      formatter: emptyValue,
    }
  ];

  const CONFIGURABLE_HEADERS = [
    {
      text: "User",
      dataField: "user",
      visible: true,
      //width: 150,
      sort: false,
      formatter: emptyValue,
    },
    {
      text: "Flow Name",
      dataField: "flowName",
      visible: true,
      //width: 150,
      sort: false,
      formatter: emptyValue,
    }
  ];

  const StepDefinitionTypeTitles = {
    "INGESTION": "Loading",
    "ingestion": "Loading",
    "MAPPING": "Mapping",
    "mapping": "Mapping",
    "MASTERING": "Mastering",
    "mastering": "Mastering",
    "MATCHING": "Matching",
    "matching": "Matching",
    "MERGING": "Merging",
    "merging": "Merging",
    "CUSTOM": "Custom",
    "custom": "Custom"
  };

  const saveColumnOrder = (field, order) => {
    let newDataStorage;
    const storage = getViewSettings();
    newDataStorage = {
      ...storage, monitorStepsFlowsTable: {
        ...storage.monitorStepsFlowsTable,
        sortColumnName: field,
        sortColumn: order
      }
    };
    setViewSettings(newDataStorage);
  };

  const saveExpandedTableKeys = () => {
    const storage = getViewSettings();
    let newDataStorage;
    newDataStorage = {
      ...storage, monitorStepsFlowsTable: {
        ...storage.monitorStepsFlowsTable,
        expandedTableKeys: expandCollapseIdRows,
      }
    };
    setViewSettings(newDataStorage);
  };

  const saveColumnsToShow = (filteredColumns?) => {
    const storage = getViewSettings();
    let newDataStorage;
    newDataStorage = {
      ...storage, monitorStepsFlowsTable: {
        ...storage.monitorStepsFlowsTable,
        columnOptions: checkedAttributes,
        filteredColumns: filteredColumns
      }
    };
    setViewSettings(newDataStorage);
  };

  const getColumnOrder = () => {
    const storage = getViewSettings();
    let storageAux = storage?.monitorStepsFlowsTable;
    if (storageAux?.sortColumn) {
      let sortColumn = storageAux.sortColumn;
      return sortColumn;
    }
  };

  const getColumnsToShow = () => {
    const storage = getViewSettings();
    let storageAux = storage?.monitorStepsFlowsTable;
    if (storageAux?.columnOptions) {
      let columnOptions = storageAux.columnOptions;
      return columnOptions;
    } else return "";
  };

  const getColumnNameOrder = () => {
    const storage = getViewSettings();
    let storageAux = storage?.monitorStepsFlowsTable;
    if (storageAux?.sortColumnName) {
      let sortColumnName = storageAux.sortColumnName;
      return sortColumnName;
    }
  };

  const getExpandedTableKeys = () => {
    const storage = getViewSettings();
    let storageAux = storage?.monitorStepsFlowsTable;
    if (storageAux?.expandedTableKeys?.length > 0) {
      let expandedTableKeys = storageAux.expandedTableKeys;
      return expandedTableKeys;
    } else return [];
  };

  const statusIcon = (status) => {
    if (status && status === "running" || /^running/.test(status)) {
      return <>
        <HCTooltip text="Running" id="running-tooltip" placement="bottom">
          <ClockFill data-testid="progress" className={styles.runningStatus} />
        </HCTooltip>
      </>;
    } else if (status?.includes("completed")) {
      return <>
        <HCTooltip text="Completed Successfully" id="complete-success-tooltip" placement="bottom">
          <CheckCircleFill data-testid="success" className={styles.successStatus} />
        </HCTooltip>
      </>;
    } else if (status?.includes("canceled")) {
      return <>
        <HCTooltip text="Canceled" id="canceled-tooltip" placement="bottom">
          <i><FontAwesomeIcon
            icon={faBan}
            size="sm"
            data-testid={`canceled`}
            style={{color: "#b32424"}}
          /></i>
        </HCTooltip>
      </>;
    } else if (status?.includes("failed") && !status?.includes("errors")) {
      return <>
        <HCTooltip text="Failed" id="failed-tooltip" placement="bottom">
          <XCircleFill data-testid="failed" className={styles.errorStatus} />
        </HCTooltip>
      </>;
    } else {
      return <>
        <HCTooltip text="Completed With Errors" id="complete-errors-tooltip" placement="bottom">
          <ExclamationCircleFill data-testid="completed-with-errors" className={styles.errorStatus} />
        </HCTooltip>
      </>;
    }
  };
  const DEFAULT_JOB_RESULTS_HEADER = [...MANDATORY_HEADERS, ...CONFIGURABLE_HEADERS];
  const allColumnHeaders = DEFAULT_JOB_RESULTS_HEADER.map(item => (item.sort ? {
    ...item, sorter: (a, b, sortOrder) => {
      if (sorting === true) {
        setMonitorSortOrder(item.dataField, sortOrder);
        sorting = false;
      }
      return a - b; // DHFPROD-7711 MLTable -> Table
    }
  } : {...item}));

  // const getColumnsToShowHeaders = () => {
  //   const storage = getViewSettings();
  //   let storageAux = storage?.monitorStepsFlowsTable;
  //   if (storageAux?.filteredColumns && storageAux?.filteredColumns.length > 0) {
  //     let filteredColumns = storageAux.filteredColumns;
  //     return filteredColumns;
  //   }
  // };

  const filterVisibleColumns = () => {
    if (getColumnsToShow()) {
      let objCheckedColumns = getColumnsToShow();
      let allColumnHeadersAux = allColumnHeaders;

      for (let i = 0; i < allColumnHeadersAux.length; i++) {
        if (!objCheckedColumns["user"] && allColumnHeadersAux[i]?.dataField === "user") {
          allColumnHeadersAux.splice(i, 1);
        }
        if (!objCheckedColumns["flowName"] && allColumnHeadersAux[i]?.dataField === "flowName") {
          allColumnHeadersAux.splice(i, 1);
        }
      }
      return allColumnHeadersAux;
    } else {
      return allColumnHeaders;
    }
  };

  const [currentColumnHeaders, setCurrentColumnHeaders] = useState(filterVisibleColumns());
  const [checkedAttributesFlag, setCheckedAttributesFlag] = useState("");
  const [checkedAttributes, setCheckedAttributes] = useState(getColumnsToShow() !== "" ? getColumnsToShow() : {
    "user": true,
    "flowName": true
  });
  const [previousCheckedAttributes, setPreviousCheckedAttributes] = useState({
    "user": true,
    "flowName": true
  });

  const onCancel = () => {
    setPopoverVisibility(false);
    setCheckedAttributes({...previousCheckedAttributes});
    setCurrentColumnHeaders(currentColumnHeaders);
  };

  const onApply = () => {
    const checkedColumns = CONFIGURABLE_HEADERS.filter(columnHeader => checkedAttributes[columnHeader.dataField]);
    const filteredColumns = [...MANDATORY_HEADERS, ...checkedColumns];
    setCurrentColumnHeaders(filteredColumns);
    setPreviousCheckedAttributes({...checkedAttributes});
    setPopoverVisibility(false);
    saveColumnsToShow(filteredColumns);
  };

  const handleColOptionsChecked = (e) => {
    let obj = checkedAttributes;
    obj[e.target.value] = e.target.checked;
    setCheckedAttributes({...obj});
    checkedAttributesFlag ? checkedAttributesFlag === "false" ? setCheckedAttributesFlag("true") : setCheckedAttributesFlag("false") : setCheckedAttributesFlag("true");
  };

  const content = (
    <Popover id={`popover-overview`} className={styles.popoverJobResults}>
      <Popover.Body>
        <div data-testid="column-selector-popover" className={styles.popover}>
          <div className={styles.content}>
            {Object.keys(checkedAttributes).map(attribute => (
              <div key={attribute} className={styles.DropdownMenuItem} aria-label={"column-option"}>
                <HCCheckbox
                  id={`column-${attribute}-id`}
                  handleClick={handleColOptionsChecked}
                  value={attribute}
                  label={columnOptionsLabel[attribute]}
                  checked={checkedAttributesFlag === "" ? getColumnsToShow() !== "" ? getColumnsToShow()[attribute] : checkedAttributes[attribute] : checkedAttributes[attribute]}
                  dataTestId={`columnOptionsCheckBox-${attribute}`} />
              </div>
            ))}
          </div>
          <footer>
            <HCDivider className={styles.divider} />
            <div className={styles.footer}>
              <div>
                <HCButton size="sm" variant="outline-light" onClick={onCancel} data-testid={"cancel-column-selector"} >Cancel</HCButton>
                <span>  </span>
                <HCButton variant="primary" size="sm" onClick={onApply} disabled={false} data-testid={"apply-column-selector"} >Apply</HCButton>
              </div>
            </div>
          </footer>
        </div>
      </Popover.Body>
    </Popover>
  );

  const filterArraybyDistinctJobId = () => {
    let arraybyDistinctJobId = data.filter((value, index, self) =>
      index === self.findIndex((valueAux) => (
        valueAux.jobId === value.jobId
      ))
    );
    setExpandCollapseIdRowsOriginal(arraybyDistinctJobId.map(job => job.jobId));
    setArraybyDistinctJobId(arraybyDistinctJobId);
  };

  const sortRows = (data) => {
    let columnOrderAux, columnNameOrderAux;
    if (!flagOrderManual) {
      columnOrderAux = getColumnOrder() ? getColumnOrder() : orderColumn;
      columnNameOrderAux = getColumnNameOrder() ? getColumnNameOrder() : orderColumnName;

      if (columnNameOrderAux === "jobId") {
        columnOrderAux === "asc" && columnNameOrderAux && data.sort((a, b) => a?.stepName?.localeCompare(b?.stepName ? b?.stepName : ""));
        columnOrderAux === "desc" && columnNameOrderAux && data.sort((a, b) => b?.stepName?.localeCompare(a?.stepName ? a?.stepName : ""));
      } else {
        columnOrderAux === "asc" && columnNameOrderAux && data.sort((a, b) => a[columnNameOrderAux]?.localeCompare(b[columnNameOrderAux] ? b[columnNameOrderAux] : ""));
        columnOrderAux === "desc" && columnNameOrderAux && data.sort((a, b) => b[columnNameOrderAux]?.localeCompare(a[columnNameOrderAux] ? a[columnNameOrderAux] : ""));
      }
    } else {
      if (orderColumnName === "jobId") {
        orderColumn === "asc" && orderColumnName && data.sort((a, b) => a?.stepName?.localeCompare(b?.stepName ? b?.stepName : ""));
        orderColumn === "desc" && orderColumnName && data.sort((a, b) => b?.stepName?.localeCompare(a?.stepName ? a?.stepName : ""));
      } else {
        orderColumn === "asc" && orderColumnName && data.sort((a, b) => a[orderColumnName]?.localeCompare(b[orderColumnName] ? b[orderColumnName] : ""));
        orderColumn === "desc" && orderColumnName && data.sort((a, b) => b[orderColumnName]?.localeCompare(a[orderColumnName] ? a[orderColumnName] : ""));
      }
    }

    return data;
  };

  useEffect(() => {
    filterArraybyDistinctJobId();
  }, [data]);

  const [expandCollapseIdRows, setExpandCollapseIdRows] = useState<any[]>([]);
  const [expandCollapseIdRowsOriginal, setExpandCollapseIdRowsOriginal] = useState<any[]>([]);
  const toggleSourceTable = (expandedToggle, clicked?) => {
    clicked && saveExpandedTableKeys();
    if (expandedToggle === "expand") {
      setExpandCollapseIdRows(flagOrderManual ? expandCollapseIdRowsOriginal : !clicked ? getExpandedTableKeys().length > 0 ? getExpandedTableKeys() : expandCollapseIdRowsOriginal : expandCollapseIdRowsOriginal);
    } else {
      setExpandCollapseIdRows([]);
    }
  };

  const toggleRowExpanded = (expanded, record) => {
    let newExpandedRows = [...expandCollapseIdRows];
    if (expanded) {
      if (newExpandedRows.indexOf(record.jobId) === -1) {
        newExpandedRows.push(record.jobId);
      }
    } else {
      newExpandedRows = newExpandedRows.filter(row => row !== record.jobId);
    }
    setExpandCollapseIdRows(newExpandedRows);
  };

  const handleVisibleHeader = (headerName) => {
    return currentColumnHeaders?.find(x => x.text === headerName);
  };

  const columnUser = handleVisibleHeader(user) && !handleVisibleHeader(flowName);
  const columnFlowName = handleVisibleHeader(flowName) && !handleVisibleHeader(user);
  const noCustomColumns = !handleVisibleHeader(flowName) && !handleVisibleHeader(user);

  return (
    <>
      <div className={styles.columnSelector} data-cy="column-selector">
        <div className={styles.fixedPopup}>
          <ExpandCollapse handleSelection={(val) => toggleSourceTable(val, true)} currentSelection={""} />
          <OverlayTrigger placement="left-start" overlay={content} trigger="click" show={popoverVisibility}>
            <span data-testid={"tooltip-wrapper"} className={styles.spanColumnIcon}>
              <HCTooltip id="select-columns-tooltip" text="Select the columns to display." placement="top-end">
                <i>
                  <FontAwesomeIcon onClick={() => { setPopoverVisibility(true); }} className={styles.columnIcon} icon={faColumns} color={themeColors.info} size="2x" data-testid="column-selector-icon" />
                </i>
              </HCTooltip>
            </span>
          </OverlayTrigger>
        </div>
      </div>
      <div className={styles.tabular}>
        <HCTable
          className={`job-results-table ${columnFlowName ? "handleFlowName" : ""} ${columnUser ? " handleUser" : ""}`}
          data-testid="job-results-table"
          rowKey="jobId"
          data={arraybyDistinctJobId}
          pagination={false}
          columns={currentColumnHeaders}
          showExpandIndicator={true}
          keyUtil={"jobId"}
          onExpand={(record, expanded) => toggleRowExpanded(expanded, record)}
          expandedRowKeys={expandCollapseIdRows}
          expandedRowRender={(row) => {
            saveExpandedTableKeys();

            let nestedFlowRows = data.filter((obj) => {
              return obj.jobId === row.jobId;
            });

            return sortRows(nestedFlowRows).map((row) => (
              <div className="row rowExpandedDetail" style={{margin: 0}}>
                <div style={{width: 50}}></div>
                <div className="stepNameDiv" id={row.jobId + "_" + row.stepName} data-testid={`${row.stepName}-result`}>{row.stepName}</div>
                <div className="stepType" id={row.jobId + "_" + row.stepName}>{StepDefinitionTypeTitles[row.stepDefinitionType]}</div>
                <div className="stepStatus" id={row.jobId + "_" + row.stepName} data-testid={row.stepStatus}>{statusIcon(row.stepStatus)}</div>
                <div className="stepEntityType" id={row.jobId + "_" + row.stepName}>{row.entityName}</div>
                <div className="stepStartDate" id={row.jobId + "_" + row.stepName}>{(dateConverter(row.startTime))}</div>
                <div className="stepDuration" id={row.jobId + "_" + row.stepName}>{row.duration}</div>
                <div className={`${noCustomColumns ? "stepDocumentsAux" : "stepDocuments"}`} id={row.jobId + "_" + row.stepName}>{row.successfulItemCount}</div>
                <div className={`${columnUser ? "stepUserAux" : "stepUser"}`} id={row.jobId + "_" + row.stepName} style={{display: handleVisibleHeader(user) ? "" : "none"}}>{row.user}</div>
                <div className="stepFlowName" id={row.jobId + "_" + row.stepName} style={{display: handleVisibleHeader(flowName) ? "" : "none"}}>{row.flowName}</div>
              </div>
            ), []);
          }}
        />
      </div>
      {openJobResponse && <JobResponse jobId={jobId} setOpenJobResponse={handleCloseJobResponse} runningFlow={undefined} />}
    </>
  );
};

export default JobResultsTableView;