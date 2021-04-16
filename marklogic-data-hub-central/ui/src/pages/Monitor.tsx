import React, {useContext, useEffect, useState} from "react";
import styles from "./Monitor.module.scss";
import {AuthoritiesContext} from "../util/authorities";
import tiles from "../config/tiles.config";
import {MissingPagePermission} from "../config/messages.config";
import axios from "axios";
import {UserContext} from "../util/user-context";
import JobResultsTableView from "../components/job-results-table-view/job-results-table-view";
import SearchPagination from "../components/search-pagination/search-pagination";
import {SearchContext} from "../util/search-context";

const Monitor: React.FC = () => {

  const [, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  //Role based access
  const authorityService = useContext(AuthoritiesContext);
  const canAccessMonitor = authorityService.canAccessMonitor();
  const {
    handleError
  } = useContext(UserContext);
  const {
    monitorOptions
  } = useContext(SearchContext);


  const getJobResults = async () => {
    try {
      setIsLoading(true);
      const response = await axios({
        method: "POST",
        url: `/api/jobs/stepResponses`,
        data: {
          "start": monitorOptions.start,
          "pageLength": monitorOptions.pageLength
        }
      });
      if (response.data) {
        setData(response.data.results);
        setTotalDocuments(response.data.total);
      }
    } catch (error) {
      console.error("error", error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getJobResults();
  }, [monitorOptions]);

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
      <div id="top-search-pagination-bar">
        <SearchPagination
          total={totalDocuments}
          pageNumber={monitorOptions.pageNumber}
          pageSize={monitorOptions.pageSize}
          pageLength={monitorOptions.pageLength}
          maxRowsPerPage={monitorOptions.maxRowsPerPage}>
        </SearchPagination>
      </div>
      <div>
        <JobResultsTableView data={data}/>
      </div>
      <SearchPagination
        total={totalDocuments}
        pageNumber={monitorOptions.pageNumber}
        pageSize={monitorOptions.pageSize}
        pageLength={monitorOptions.pageLength}
        maxRowsPerPage={monitorOptions.maxRowsPerPage}
      />
    </div>
  );

};

export default Monitor;
