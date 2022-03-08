import React, {useState, useEffect, useContext} from "react";
import { DetailContext } from "../store/DetailContext";
import { SearchContext } from "../store/SearchContext";
import { UserContext } from "../store/UserContext";
import Metrics from "../components/Metrics/Metrics";
import SearchBox from "../components/SearchBox/SearchBox";
import RecentSearches from "../components/RecentSearches/RecentSearches";
import New from "../components/New/New";
import RecentRecords from "../components/RecentRecords/RecentRecords";
import Section from "../components/Section/Section";
import Loading from "../components/Loading/Loading";
import {getSummary} from "../api/api";
import "./Dashboard.scss";

type Props = {};

const Dashboard: React.FC<Props> = (props) => {

  const detailContext = useContext(DetailContext);
  const searchContext = useContext(SearchContext);
  const userContext = useContext(UserContext);

  const [config, setConfig] = useState<any>(null);
  const [recentSearches, setRecentSearches] = useState<any>([]);
  const [recentRecords, setRecentRecords] = useState<any>({});
  const [summary, setSummary] = useState<any>({});

  useEffect(() => {
    searchContext.handleGetSearchLocal();
    setSummary(getSummary({}));
    if (userContext.config.api && 
      userContext.config.api.recentStorage === "database") {
      detailContext.handleGetRecent();
    } else {
      detailContext.handleGetRecentLocal();
    }
  }, []);

  useEffect(() => {
    setConfig(userContext.config);
  }, [userContext.config]);

  useEffect(() => {
    setRecentSearches(searchContext.recentSearches);
  }, [searchContext.recentSearches]);

  useEffect(() => {
    setRecentRecords(detailContext.recentRecords);
  }, [detailContext.recentRecords]);

  return (
    <div className="dashboard">

      {config?.dashboard ?   

      <div className="container-fluid">

        <div className="row">

            <Metrics data={summary.metrics} config={config.dashboard.metrics} />

        </div>

        <div className="row">

          <div className="col-lg">

            <Section title="Search">
                <h4 style={{marginBottom: "20px"}}>New Search</h4>
                <SearchBox config={config.searchbox} button="vertical" width="100%" />

                {config?.dashboard?.recentSearches &&
                  <div>
                    <div className="divider">- or -</div>
                    <div style={{marginTop: "15px"}}>
                      <h4>Recent Searches</h4>
                      <RecentSearches data={recentSearches} config={config.dashboard.recentSearches} />
                    </div>
                  </div>
                }
            </Section>

          </div>

          <div className="col-lg">

            {config?.dashboard?.new &&
              <Section title="What's New with Entities">
                <New />
              </Section>
            }

            {config?.dashboard?.recentRecords && !detailContext.loading ? 
              <Section title="Recently Visited" config={{
                "mainStyle": {
                  "maxHeight": "500px"
                }
              }}>
                  <RecentRecords data={recentRecords} config={config.dashboard.recentRecords} />
              </Section>
            : <Loading />}

          </div>

        </div>

      </div>

      : <Loading />}

    </div>
  );
};

export default Dashboard;
