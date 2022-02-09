import React, {useState, useEffect, useContext} from "react";
import Metrics from "../components/Metrics/Metrics";
import SearchBox from "../components/SearchBox/SearchBox";
import Saved from "../components/Saved/Saved";
import New from "../components/New/New";
import Recent from "../components/Recent/Recent";
import Section from "../components/Section/Section";
import Spinner from "react-bootstrap/Spinner";
import { UserContext } from "../store/UserContext";
import {getRecent} from "../api/api";
import {getSaved} from "../api/api";
import {getSummary} from "../api/api";
import "./Dashboard.scss";

type Props = {};

const Dashboard: React.FC<Props> = (props) => {

  const userContext = useContext(UserContext);

  const [config, setConfig] = useState<any>(null);
  const [recent, setRecent] = useState<any>({});
  const [saved, setSaved] = useState<any>({});
  const [summary, setSummary] = useState<any>({});

  useEffect(() => {
    setRecent(getRecent({}));
    setSaved(getSaved({}));
    setSummary(getSummary({}));
  }, []);

  useEffect(() => {
    setConfig(userContext.config);
  }, [userContext.config]);

  const spinner = (
    <div className="spinner">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );

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
                <div className="divider">- or -</div>
                <div style={{marginTop: "20px"}}>
                  <h4>Saved Searches</h4>
                  <Saved data={saved} config={config.dashboard.saved} />
                </div>
            </Section>

          </div>

          <div className="col-lg">

            <Section title="What's New with Entities">
              <New />
            </Section>

            <Section title="Recently Visited">
                <Recent data={recent} config={config.dashboard.recent} />
            </Section>

          </div>

        </div>

      </div>

      : spinner}

    </div>
  );
};

export default Dashboard;
