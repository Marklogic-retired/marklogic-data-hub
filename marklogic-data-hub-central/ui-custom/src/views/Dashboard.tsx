import React, { useState, useEffect, useContext } from "react";
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
import "./Dashboard.scss";
import RecentClear from "../components/RecentClear/RecentClear"


import { Container, Col, Row } from "react-bootstrap";

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

  useEffect(() => {
    searchContext.handleGetSearchLocal();
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
    <div className="dashboard d-flex flex-row flex-column-fluid">

      {config?.dashboard ? 
          <Container className="mt-3"> 
            {config?.dashboard?.metrics?.component && config?.dashboard?.metrics?.config &&
              React.createElement(
                COMPONENTS[config.dashboard.metrics.component],
                { data: metrics, config: config.dashboard.metrics.config }, null
              )} 
            <Row>
              <Col md={6}>
                <Section title="Search"> 
                  <SearchBox config={config.searchbox} button="vertical" width="100%" />
                  {config?.dashboard?.recentSearches &&
                    <div>
                      <div className="py-3 text-center fw-bold">- or -</div> 
                        <h6 className="d-flex justify-content-between align-items-center">Recent Searches
                          <RecentClear title="recent search" type="recentSearches"></RecentClear>
                        </h6>
                        {config?.dashboard?.recentSearches &&
                          React.createElement(
                            COMPONENTS[config.dashboard.recentSearches.component],
                            { data: recentSearches, config: config.dashboard.recentSearches.config }, null
                          )} 
                    </div>
                  }
                </Section> 
              </Col>
              <Col md={6}>
              {config?.dashboard?.whatsNew &&
                  <Section title="What's New with Entities">
                    {config?.dashboard?.whatsNew?.component && config?.dashboard?.whatsNew?.config &&
                      React.createElement(
                        COMPONENTS[config.dashboard.whatsNew.component],
                        { data: whatsNew, config: config.dashboard.whatsNew.config }, null
                      )}
                  </Section>
                }

                {config?.dashboard?.recentRecords ? !detailContext.loading ?
                  <Section title="Recently Visited">
                    {config?.dashboard?.recentRecords &&
                      React.createElement(
                        COMPONENTS[config.dashboard.recentRecords.component],
                        { data: recentRecords, config: config.dashboard.recentRecords.config }, null
                      )}
                  </Section>
                  : <Loading /> : null}
              </Col>
            </Row>
          </Container>

      

        : <Loading />}

    </div>
  );
};

export default Dashboard;
