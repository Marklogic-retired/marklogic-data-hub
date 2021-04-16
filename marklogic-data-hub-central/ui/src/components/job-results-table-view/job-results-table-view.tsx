import React from "react";
import styles from "./job-results-table-view.module.scss";
import {MLTable, MLTooltip} from "@marklogic/design-system";
import {dateConverter} from "../../util/date-conversion";
import {ClockCircleFilled, CheckCircleFilled, CloseCircleFilled} from "@ant-design/icons";
import {parse} from "iso8601-duration";


const DEFAULT_JOB_RESULTS_HEADER = [
  {
    title: "Step Name",
    dataIndex: "stepName",
    visible: true,
    width: 200
  },
  {
    title: "Step Type",
    dataIndex: "stepDefinitionType",
    visible: true,
    width: 150
  },
  {
    title: "Status",
    dataIndex: "jobStatus",
    visible: true,
    width: 100,
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
    width: 100
  },
  {
    title: "Start Time",
    dataIndex: "startTime",
    visible: true,
    width: 150,
    render: ((startTime:string) => dateConverter(startTime))
  },
  {
    title: "Duration",
    dataIndex: "duration",
    visible: true,
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

  },
  {
    title: "User",
    dataIndex: "user",
    visible: true,
    width: 150
  },
  {
    title: "Job ID",
    dataIndex: "jobId",
    visible: true,
    width: 150
  },
  {
    title: "Flow Name",
    dataIndex: "flowName",
    visible: true,
    width: 150
  }
];

const JobResultsTableView = (props) => {
  return (
    <div className={styles.tabular}>
      <MLTable bordered
        data-testid="job-result-table"
        rowKey="job"
        dataSource={props.data}
        pagination={false}
        columns={DEFAULT_JOB_RESULTS_HEADER}
      />
    </div>
  );
};

export default JobResultsTableView;
