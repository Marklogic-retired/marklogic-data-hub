import React, {useContext} from "react";
import styles from "./Monitor.module.scss";
import {AuthoritiesContext} from "../util/authorities";
import tiles from "../config/tiles.config";
import {MissingPagePermission} from "../config/messages.config";
import {jobResults} from "../assets/mock-data/monitor/job-results";
import JobResultsTableView from "../components/job-results-table-view/job-results-table-view";

const Monitor: React.FC = () => {

  //Role based access
  const authorityService = useContext(AuthoritiesContext);
  const canAccessMonitor = authorityService.canAccessMonitor();

  return (
    <div>
      {canAccessMonitor ?
        <div className={styles.monitorContainer}>
          <div className={styles.intro}>
            <p>{tiles.monitor.intro}</p>
          </div>
        </div>
        :
        <div className={styles.monitorContainer}>
          <p>{MissingPagePermission}</p>
        </div>
      }
      <div>
        <JobResultsTableView data={jobResults.results}/>
      </div>
    </div>
  );

};

export default Monitor;
