import React, {useState, useEffect, useContext} from "react";
import { DetailContext } from "../store/DetailContext";
import { MetricsContext } from "../store/MetricsContext";
import { SearchContext } from "../store/SearchContext";
import { UserContext } from "../store/UserContext";
import Metrics from "../components/Metrics/Metrics";
import SearchBox from "../components/SearchBox/SearchBox";
import RecentSearches from "../components/RecentSearches/RecentSearches";
import RecentRecords from "../components/RecentRecords/RecentRecords";
import WhatsNew from "../components/WhatsNew/WhatsNew";
import Section from "../components/Section/Section";
import Loading from "../components/Loading/Loading";
import {getSummary} from "../api/api";
import "./Dashboard.scss";
import RecentClear from "../components/RecentClear/RecentClear"

type Props = {};

const COMPONENTS = {
  Metrics: Metrics,
  RecentRecords: RecentRecords,
  RecentSearches: RecentSearches,
  WhatsNew: WhatsNew,
};

const Dashboard: React.FC<Props> = (props) => {

  const detailContext = useContext(DetailContext);
  const metricsContext = useContext(MetricsContext);
  const searchContext = useContext(SearchContext);
  const userContext = useContext(UserContext);

  const [config, setConfig] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>([]);
  const [whatsNew, setWhatsNew] = useState<any>([]);
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
    userContext.config?.dashboard?.metrics && metricsContext.handleGetMetrics();
    userContext.config?.dashboard?.whatsNew && metricsContext.handleGetWhatsNew();
  }, [userContext.config]);

  useEffect(() => {
    setMetrics(metricsContext.metrics);
  }, [metricsContext.metrics]);

  useEffect(() => {
    setRecentSearches(searchContext.recentSearches);
  }, [searchContext.recentSearches]);

  useEffect(() => {
    setRecentRecords(detailContext.recentRecords);
  }, [detailContext.recentRecords]);

  useEffect(() => {
    setWhatsNew(metricsContext.whatsNew);
  }, [metricsContext.whatsNew]);

  return (
    <div className="dashboard">

      {config?.dashboard ?   

      <div className="container-fluid">

        <div className="row">

            {config?.dashboard?.metrics?.component && config?.dashboard?.metrics?.config &&
              React.createElement(
                COMPONENTS[config.dashboard.metrics.component],
                { data: metrics, config: config.dashboard.metrics.config }, null
            )}

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
                      <h4>Recent Searches
                      <RecentClear title="recent search" type="recentSearches"></RecentClear>
                      </h4>
                      {config?.dashboard?.recentSearches &&
                        React.createElement(
                          COMPONENTS[config.dashboard.recentSearches.component],
                          { data: recentSearches, config: config.dashboard.recentSearches.config }, null
                      )}
                    </div>
                  </div>
                }
            </Section>

          </div>

          <div className="col-lg">

            {config?.dashboard?.whatsNew &&
              <Section title="What's New with Entities" config={{
                "mainStyle": {
                  "minHeight": "240px"
                }
              }}>
                {config?.dashboard?.whatsNew?.component && config?.dashboard?.whatsNew?.config &&
                  React.createElement(
                    COMPONENTS[config.dashboard.whatsNew.component],
                    { data: whatsNew, config: config.dashboard.whatsNew.config }, null
                )}
              </Section>
            }

            {config?.dashboard?.recentRecords ? !detailContext.loading ? 
              <Section title="Recently Visited" config={{
                "mainStyle": {
                  "maxHeight": "500px"
                }
              }}>
                  {config?.dashboard?.recentRecords &&
                    React.createElement(
                      COMPONENTS[config.dashboard.recentRecords.component],
                      { data: recentRecords, config: config.dashboard.recentRecords.config }, null
                  )}
              </Section>
            : <Loading /> : null}

          </div>

        </div>

      </div>

      : <Loading />}

    </div>
  );
};

export default Dashboard;
