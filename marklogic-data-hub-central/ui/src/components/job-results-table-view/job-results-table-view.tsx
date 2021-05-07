import React, {useContext, useState} from "react";
import styles from "./job-results-table-view.module.scss";
import {MLTable, MLTooltip} from "@marklogic/design-system";
import {dateConverter} from "../../util/date-conversion";
import {ClockCircleFilled, CheckCircleFilled, CloseCircleFilled} from "@ant-design/icons";
import {parse} from "iso8601-duration";
import {SearchContext} from "../../util/search-context";
import {Menu, Popover} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faColumns} from "@fortawesome/free-solid-svg-icons";
import {MLCheckbox, MLButton, MLDivider} from "@marklogic/design-system";
import "./job-results-table-view.scss";

const JobResultsTableView = (props) => {
  const [popoverVisibility, setPopoverVisibility] = useState<boolean>(false);

  const {
    setMonitorSortOrder
  } = useContext(SearchContext);
  let sorting = true;
  const columnOptionsLabel = {
    user: "User",
    jobId: "Job ID",
    flowName: "Flow Name",
  };

  const MANDATORY_HEADERS = [
    {
      title: "Step Name",
      dataIndex: "stepName",
      visible: true,
      width: 200,
      sortable: true,
    },
    {
      title: "Step Type",
      dataIndex: "stepDefinitionType",
      visible: true,
      width: 150,
      sortable: true
    },
    {
      title: "Status",
      dataIndex: "jobStatus",
      visible: true,
      width: 100,
      sortable: false,
      align: "center",
      render: (status) => {
        if (status === "running") {
          return <>
            <MLTooltip title={"Running"} placement={"bottom"}>
              <ClockCircleFilled data-testid= "progress" style={{color: "#5B69AF"}}/>
            </MLTooltip>
          </>;

        } else if (status === "finished") {
          return <>
            <MLTooltip title={"Completed Successfully"} placement={"bottom"}>
              <CheckCircleFilled data-testid= "success" style={{color: "#389E0D"}}/>
            </MLTooltip>
          </>;
        } else {
          return <>
            <MLTooltip title={"Completed With Errors"} placement={"bottom"}>
              <CloseCircleFilled data-testid= "error" style={{color: "#B32424"}}/>
            </MLTooltip>
          </>;
        }
      }
    },
    {
      title: "Entity",
      dataIndex: "entityName",
      visible: true,
      width: 100,
      sortable: true
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      visible: true,
      width: 150,
      sortable: true,
      render: ((startTime:string) => dateConverter(startTime))
    },
    {
      title: "Duration",
      dataIndex: "duration",
      visible: true,
      sortable: false,
      width: 150,
      render: (duration) => {
        let durationObj = parse(duration);
        let days = durationObj.days && durationObj.days > 0 ? durationObj.days + "d" : " ";
        let hours = durationObj.hours && durationObj.hours > 0 ? durationObj.hours + "h" : " ";
        let min = durationObj.minutes && durationObj.minutes > 0 ? durationObj.minutes + "m" : " ";
        let seconds = durationObj.seconds && durationObj.seconds > 0 ? durationObj.seconds + "s" : " ";
        let finalDuration = days+" "+hours+" "+min+" "+seconds;
        return <span>{finalDuration}</span>;
      }
    },
    {
      title: "Records Processed",
      dataIndex: "successfulItemCount",
      visible: true,
      width: 150,
      sortable: false,
      render: (successfulItemCount, record) => {
        return <>
          <div>
            <CheckCircleFilled style={{color: "#389E0D"}}/>
            <span className={styles.events}>
              {successfulItemCount}
            </span>
          </div>
          <div>
            <CloseCircleFilled style={{color: "#B32424"}}/>
            <span className={styles.events}>
              {record.failedItemCount}
            </span>
          </div>
        </>;
      }
    }
  ];

  const CONFIGURABLE_HEADERS = [
    {
      title: "User",
      dataIndex: "user",
      visible: true,
      width: 150,
      sortable: false
    },
    {
      title: "Job ID",
      dataIndex: "jobId",
      visible: true,
      width: 150,
      sortable: false
    },
    {
      title: "Flow Name",
      dataIndex: "flowName",
      visible: true,
      width: 150,
      sortable: false
    }
  ];

  const DEFAULT_JOB_RESULTS_HEADER = [...MANDATORY_HEADERS, ...CONFIGURABLE_HEADERS];
  const allColumnHeaders = DEFAULT_JOB_RESULTS_HEADER.map(item => (item.sortable ?{...item, sorter: (a, b, sortOrder) => {
    if (sorting === true) {
      setMonitorSortOrder(item.dataIndex, sortOrder);
      sorting = false;
    }
  }}: {...item}));

  const [currentColumnHeaders, setCurrentColumnHeaders] = useState(allColumnHeaders);
  const [checkedAttributes, setCheckedAttributes] = useState({
    "user": true,
    "jobId": true,
    "flowName": true
  });
  const [previousCheckedAttributes, setPreviousCheckedAttributes] = useState({
    "user": true,
    "jobId": true,
    "flowName": true
  });

  const onCancel = () => {
    setPopoverVisibility(false);
    setCheckedAttributes({...previousCheckedAttributes});
    setCurrentColumnHeaders(currentColumnHeaders);
  };

  const onApply = () => {
    const checkedColumns = CONFIGURABLE_HEADERS.filter(columnHeader => checkedAttributes[columnHeader.dataIndex]);
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
    <div data-testid="column-selector-popover" className={styles.popover}>
      <div className={styles.content}>
        <Menu>
          {Object.keys(checkedAttributes).map(attribute => (
            <Menu.Item key={attribute} className={styles.DropdownMenuItem}><MLCheckbox
              data-testid={`columnOptionsCheckBox-${attribute}`}
              key={attribute}
              value={attribute}
              onChange={handleColOptionsChecked}
              defaultChecked={true}
              className={styles.checkBoxItem}
              checked={checkedAttributes[attribute]}
            >{columnOptionsLabel[attribute]}</MLCheckbox></Menu.Item>
          ))}
        </Menu>
      </div>
      <footer>
        <MLDivider className={styles.divider} />
        <div className={styles.footer}>
          <div>
            <MLButton size="small" onClick={onCancel} >Cancel</MLButton>
            <span>  </span>
            <MLButton type="primary" size="small" onClick={onApply} disabled={false} >Apply</MLButton>
          </div>
        </div>
      </footer>
    </div>
  );


  return (
    <>
      <div className={styles.columnSelector} data-cy="column-selector">
        <div className={styles.fixedPopup}>
          <MLTooltip title="Select the columns to display." placement="topRight">
            <Popover placement="leftTop" content={content} trigger="click" visible={popoverVisibility} className={styles.fixedPopup}>
              <FontAwesomeIcon onClick={() => { setPopoverVisibility(true); }} className={styles.columnIcon} icon={faColumns} color="#5B69AF" size="lg" data-testid="column-selector-icon"/>
            </Popover>
          </MLTooltip>
        </div>
      </div>
      <div className={styles.tabular}>
        <MLTable bordered
          data-testid="job-result-table"
          rowKey="startTime"
          dataSource={props.data}
          pagination={false}
          columns={currentColumnHeaders}
        />
      </div>
    </>
  );
};

export default JobResultsTableView;
