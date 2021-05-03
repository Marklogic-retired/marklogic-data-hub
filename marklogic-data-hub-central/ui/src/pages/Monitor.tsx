import React, {useContext, useEffect, useState} from "react";
import styles from "./Monitor.module.scss";
import {AuthoritiesContext} from "../util/authorities";
import tiles from "../config/tiles.config";
import {MissingPagePermission} from "../config/messages.config";
import axios from "axios";
import {UserContext} from "../util/user-context";
import JobResultsTableView from "../components/job-results-table-view/job-results-table-view";
import SearchPagination from "../components/search-pagination/search-pagination";
import {Layout} from "antd";
import SidebarFooter from "../components/sidebar-footer/sidebar-footer";
import MonitorSidebar from "../components/monitor-sidebar/monitor-sidebar";
import MonitorSelectedFacets from "../components/monitor-selected-facets/monitor-selected-facets";
import {MonitorContext} from "../util/monitor-context";


const Monitor: React.FC = () => {

  const {Content, Sider} = Layout;

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
  const {
    handleError
  } = useContext(UserContext);
  const {
    monitorOptions
  } = useContext(MonitorContext);


  const getJobResults = async () => {
    try {
      setIsLoading(true);
      const response = await axios({
        method: "POST",
        url: `/api/jobs/stepResponses`,
        data: {
          start: monitorOptions.start,
          pageLength: monitorOptions.pageLength,
          sortOrder: monitorOptions.sortOrder,
          facets: monitorOptions.selectedFacets
        }
      });
      if (response.data) {
        setData(response.data.results);
        setTotalDocuments(response.data.total);
        setFacets(response.data.facets);
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

  const updateSelectedFacets = (facets) => {
    setSelectedFacets(facets);
  };

  const updateCheckedFacets = (facets) => {
    setGreyFacets(facets);
  };

  return (
    <Layout className={styles.layout}>
      <Sider className={styles.sideBarFacets}
        trigger={null}
        collapsedWidth={0}
        collapsible
        width={"20vw"}
      >
        <MonitorSidebar
          facets={facets}
          facetRender={updateSelectedFacets}
          checkFacetRender={updateCheckedFacets}
        />
        <SidebarFooter />
      </Sider>
      <Content className={styles.content}>
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
              maxRowsPerPage={monitorOptions.maxRowsPerPage}
            >
            </SearchPagination>
          </div>
          <div className={styles.selectedFacets}>
            <MonitorSelectedFacets
              selectedFacets={selectedFacets}
              greyFacets={greyFacets}
              applyClicked={applyClicked}
              showApply={showApply}
              toggleApply={(clicked) => toggleApply(clicked)}
              toggleApplyClicked={(clicked) => toggleApplyClicked(clicked)}
            />
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
      </Content>
    </Layout>
  );

};

export default Monitor;
