import React, {useContext, useState} from "react";
import styles from "./job-results-table-view.module.scss";
import {dateConverter, renderDuration} from "../../util/date-conversion";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faColumns} from "@fortawesome/free-solid-svg-icons";
import "./job-results-table-view.scss";
import {MonitorContext} from "../../util/monitor-context";
import JobResponse from "../job-response/job-response";
import {CheckCircleFill, ClockFill, XCircleFill} from "react-bootstrap-icons";
import {HCButton, HCCheckbox, HCDivider, HCTooltip, HCTable} from "@components/common";
import Popover from "react-bootstrap/Popover";
import {OverlayTrigger} from "react-bootstrap";

const JobResultsTableView = (props) => {
  const [popoverVisibility, setPopoverVisibility] = useState<boolean>(false);
  const [jobId, setJobId] = useState<string>("");
  const [openJobResponse, setOpenJobResponse] = useState<boolean>(false);

  const handleOpenJobResponse = (jobId) => {
    setJobId(jobId);
    setOpenJobResponse(true);
  };

  const handleCloseJobResponse = (jobId) => {
    setOpenJobResponse(false);
    setJobId("");
  };

  const {
    setMonitorSortOrder
  } = useContext(MonitorContext);
  let sorting = true;
  const columnOptionsLabel = {
    user: "User",
    flowName: "Flow Name",
  };

  const MANDATORY_HEADERS = [
    {
      text: "Job ID",
      dataField: "jobId",
      visible: true,
      width: 200,
      sort: false,
      formatter: (jobId) => {
        return <><a onClick={() => handleOpenJobResponse(jobId)}>{jobId}</a></>;
      }
    },
    {
      text: "Step Name",
      dataField: "stepName",
      visible: true,
      width: 200,
      sort: true,
    },
    {
      text: "Step Type",
      dataField: "stepDefinitionType",
      visible: true,
      width: 150,
      sort: true
    },
    {
      text: "Status",
      dataField: "jobStatus",
      visible: true,
      width: 100,
      sort: false,
      align: "center",
      formatter: (status) => {
        if (status === "running" || /^running/.test(status)) {
          return <>
            <HCTooltip text="Running" id="running-tooltip" placement="bottom">
              <ClockFill data-testid= "progress" style={{color: "#5B69AF"}}/>
            </HCTooltip>
          </>;

        } else if (status === "finished") {
          return <>
            <HCTooltip text="Completed Successfully" id="complete-success-tooltip" placement="bottom">
              <CheckCircleFill data-testid= "success" style={{color: "#389E0D"}}/>
            </HCTooltip>
          </>;
        } else {
          return <>
            <HCTooltip text="Completed With Errors" id="complete-errors-tooltip" placement="bottom">
              <XCircleFill data-testid= "error" style={{color: "#B32424"}}/>
            </HCTooltip>
          </>;
        }
      }
    },
    {
      text: "Entity",
      dataField: "entityName",
      visible: true,
      width: 100,
      sort: true
    },
    {
      text: "Start Time",
      dataField: "startTime",
      visible: true,
      width: 150,
      sort: true,
      formatter: ((startTime:string) => dateConverter(startTime))
    },
    {
      text: "Duration",
      dataField: "duration",
      visible: true,
      sort: false,
      width: 100,
      formatter: ((duration:string) => renderDuration(duration))
    },
    {
      text: "Records Written",
      dataField: "successfulItemCount",
      visible: true,
      width: 150,
      sort: false,
      align: "right",
    }
  ];

  const CONFIGURABLE_HEADERS = [
    {
      text: "User",
      dataField: "user",
      visible: true,
      width: 150,
      sort: false
    },
    {
      text: "Flow Name",
      dataField: "flowName",
      visible: true,
      width: 150,
      sort: false
    }
  ];

  const DEFAULT_JOB_RESULTS_HEADER = [...MANDATORY_HEADERS, ...CONFIGURABLE_HEADERS];
  const allColumnHeaders = DEFAULT_JOB_RESULTS_HEADER.map(item => (item.sort ?{...item, sorter: (a, b, sortOrder) => {
    if (sorting === true) {
      setMonitorSortOrder(item.dataField, sortOrder);
      sorting = false;
    }
    return a-b; // DHFPROD-7711 MLTable -> Table
  }}: {...item}));

  const [currentColumnHeaders, setCurrentColumnHeaders] = useState(allColumnHeaders);
  const [checkedAttributes, setCheckedAttributes] = useState({
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
    const filteredColumns =  [...MANDATORY_HEADERS, ...checkedColumns];
    setCurrentColumnHeaders(filteredColumns);
    setPreviousCheckedAttributes({...checkedAttributes});
    setPopoverVisibility(false);
  };

  const handleColOptionsChecked =  (e) => {
    let obj = checkedAttributes;
    obj[e.target.value] = e.target.checked;
    setCheckedAttributes({...obj});
  };

  const content = (
    <Popover id={`popover-overview`} className={styles.popoverJobResults}>
      <Popover.Body>
        <div data-testid="column-selector-popover" className={styles.popover}>
          <div className={styles.content}>
            {Object.keys(checkedAttributes).map(attribute => (
              <div key={attribute} className={styles.DropdownMenuItem}>
                <HCCheckbox
                  id={`column-${attribute}-id`}
                  handleClick={handleColOptionsChecked}
                  value={attribute}
                  label={columnOptionsLabel[attribute]}
                  checked={checkedAttributes[attribute]}
                  dataTestId={`columnOptionsCheckBox-${attribute}`}/>
              </div>
            ))}
          </div>
          <footer>
            <HCDivider className={styles.divider} />
            <div className={styles.footer}>
              <div>
                <HCButton size="sm" variant="outline-light" onClick={onCancel} >Cancel</HCButton>
                <span>  </span>
                <HCButton variant="primary" size="sm" onClick={onApply} disabled={false} >Apply</HCButton>
              </div>
            </div>
          </footer>
        </div>
      </Popover.Body>
    </Popover>
  );


  return (
    <>
      <div className={styles.columnSelector} data-cy="column-selector">
        <div className={styles.fixedPopup}>
          <OverlayTrigger placement="left-start" overlay={content} trigger="click" show={popoverVisibility}>
            <HCTooltip id="select-columns-tooltip" text="Select the columns to display." placement="top-end">
              <i>
                <FontAwesomeIcon onClick={() => { setPopoverVisibility(true); }} className={styles.columnIcon} icon={faColumns} color="#5B69AF" size="lg" data-testid="column-selector-icon"/>
              </i>
            </HCTooltip>
          </OverlayTrigger>
        </div>
      </div>
      <div className={styles.tabular}>
        <HCTable
          className="job-results-table"
          data-testid="job-results-table"
          rowKey="startTime"
          data={props.data}
          pagination={false}
          columns={currentColumnHeaders}
        />
      </div>
      <JobResponse jobId={jobId} openJobResponse={openJobResponse} setOpenJobResponse={handleCloseJobResponse}/>
    </>
  );
};

export default JobResultsTableView;
