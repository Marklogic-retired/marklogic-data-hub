import React, {useContext, useEffect, useState, useRef} from "react";
import styles from "./Monitor.module.scss";
import {AuthoritiesContext} from "@util/authorities";
import tiles from "@config/tiles.config";
import {MissingPagePermission} from "@config/messages.config";
import axiosInstance from "@config/axios.ts";
import {UserContext} from "@util/user-context";
import JobResultsTableView from "@components/job-results-table-view/job-results-table-view";
import SearchPagination from "@components/search-pagination/search-pagination";
import SidebarFooter from "@components/sidebar-footer/sidebar-footer";
import MonitorSidebar from "@components/monitor-sidebar/monitor-sidebar";
import MonitorSelectedFacets from "@components/monitor-selected-facets/monitor-selected-facets";
import {MonitorContext} from "@util/monitor-context";
import {getViewSettings} from "@util/user-context";
import {HCSider} from "@components/common";

const Monitor: React.FC = () => {
  const [, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [facets, setFacets] = useState<any>();
  //Role based access
  const authorityService = useContext(AuthoritiesContext);
  const canAccessMonitor = authorityService.canAccessMonitor();
  const [selectedFacets, setSelectedFacets] = useState<any[]>([]);
  const [greyFacets, setGreyFacets] = useState<any[]>([]);
  const [showApply, toggleApply] = useState(false);
  const [applyClicked, toggleApplyClicked] = useState(false);
  const storage = getViewSettings();

  const {handleError} = useContext(UserContext);
  const {monitorOptions} = useContext(MonitorContext);
  const mountedRef = useRef(true);

  const getJobResults = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance({
        method: "POST",
        url: `/api/jobs/stepResponses`,
        data: {
          start: monitorOptions.start,
          pageLength: monitorOptions.pageLength,
          sortOrder: monitorOptions.sortOrder,
          facets: monitorOptions.selectedFacets,
        },
      });
      if (response.data && mountedRef.current) {
        const dataFixed = response.data.results.map((dataItem) => {
          if (dataItem.entityName === null) {
            dataItem.entityName = "";
          }
          return dataItem;
        });
        setData(dataFixed);
        setTotalDocuments(response.data.total);
        setFacets(response.data.facets);
      } else {
        return;
      }
    } catch (error) {
      console.error("error", error);
      handleError(error);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    getJobResults();
    return () => {
      mountedRef.current = false;
    };
  }, [monitorOptions]);

  const updateSelectedFacets = facets => {
    setSelectedFacets(facets);
  };

  const updateCheckedFacets = facets => {
    setGreyFacets(facets);
  };

  const getCurrentPageTable = () => {
    let storageAux = storage?.monitorStepsFlowsTable;
    if (storageAux?.pageNumberTable) {
      let pageNumberTableAux = storageAux?.pageNumberTable;
      return pageNumberTableAux;
    } else return 1;
  };

  const getCurrentPageSizeTable = () => {
    let storageAux = storage?.monitorStepsFlowsTable;
    if (storageAux?.pageSizeTable) {
      let pageSizeTableAux = storageAux?.pageSizeTable;
      return pageSizeTableAux;
    } else return 20;
  };

  return (
    <div className={styles.layout}>
      <HCSider placement="left" show={true} footer={<SidebarFooter />}>
        <MonitorSidebar facets={facets} facetRender={updateSelectedFacets} checkFacetRender={updateCheckedFacets} />
      </HCSider>
      <div className={styles.content} id="monitorContent">
        <div className={styles.mainContainer}>
          {canAccessMonitor ? (
            <div className={styles.monitorContainer}>
              <p className={styles.intro}>{tiles.monitor.intro}</p>
            </div>
          ) : (
            <div className={styles.monitorContainer}>
              <p>{MissingPagePermission}</p>
            </div>
          )}
          <div className={styles.selectedFacets}>
            <MonitorSelectedFacets
              selectedFacets={selectedFacets}
              greyFacets={greyFacets}
              applyClicked={applyClicked}
              showApply={showApply}
              toggleApply={clicked => toggleApply(clicked)}
              toggleApplyClicked={clicked => toggleApplyClicked(clicked)}
            />
          </div>
          <div id="top-search-pagination-bar" className={styles.monitorPagination}>
            <SearchPagination
              total={totalDocuments}
              pageNumber={getCurrentPageTable() !== 1 ? getCurrentPageTable() : monitorOptions.pageNumber}
              pageSize={getCurrentPageSizeTable() !== 20 ? getCurrentPageSizeTable() : monitorOptions.pageSize}
              pageLength={monitorOptions.pageLength}
              maxRowsPerPage={monitorOptions.maxRowsPerPage}
            />
          </div>
          <div>
            <JobResultsTableView data={data} />
          </div>
          <SearchPagination
            total={totalDocuments}
            pageNumber={getCurrentPageTable() !== 1 ? getCurrentPageTable() : monitorOptions.pageNumber}
            pageSize={getCurrentPageSizeTable() !== 20 ? getCurrentPageSizeTable() : monitorOptions.pageSize}
            pageLength={monitorOptions.pageLength}
            maxRowsPerPage={monitorOptions.maxRowsPerPage}
          />
        </div>
      </div>
    </div>
  );
};

export default Monitor;
