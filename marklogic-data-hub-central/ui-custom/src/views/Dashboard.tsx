import React, {useState, useEffect, useContext} from "react";
import Metrics from "../components/Metrics/Metrics";
import SearchBox from "../components/SearchBox/SearchBox";
import Saved from "../components/Saved/Saved";
import New from "../components/New/New";
import Recent from "../components/Recent/Recent";
import Section from "../components/Section/Section";
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

  return (
    <div className="dashboard">
      <div className="dashboard container-fluid">

        <div className="row">

          {config?.dashboard?.metrics ? 
            <Metrics data={summary.metrics} config={config.dashboard.metrics} />
          : null}

        </div>

        <div className="row">

          <div className="col-lg">

            <Section title="Search">
              <h4 style={{marginBottom: "20px"}}>New Search</h4>

              {config?.searchbox ? 
                <SearchBox config={config.searchbox} button="vertical" width="100%" />
              : null}

              <div className="divider">- or -</div>
              <div style={{marginTop: "20px"}}>
                <h4>Saved Searches</h4>

                {config?.dashboard?.saved ? 
                  <Saved data={saved} config={config.dashboard.saved} />
                : null}

              </div>
            </Section>

          </div>

          <div className="col-lg">

            <Section title="What's New with Entities">
              <New />
            </Section>

            <Section title="Recently Visited">

              {config?.dashboard?.recent ? 
                <Recent data={recent} config={config.dashboard.recent} />
              : null}

            </Section>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
