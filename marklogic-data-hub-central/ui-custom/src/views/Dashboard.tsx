import React, {useState, useEffect} from "react";
import Metrics from "../components/Metrics/Metrics";
import SearchBox from "../components/SearchBox/SearchBox";
import Saved from "../components/Saved/Saved";
import New from "../components/New/New";
import Recent from "../components/Recent/Recent";
import Section from "../components/Section/Section";
import {configDashboard} from "../config/dashboard.js";
import {configSearchbox} from "../config/searchbox.js";
import {getRecent} from "../api/api";
import {getSaved} from "../api/api";
import {getSummary} from "../api/api";
import styles from "./Dashboard.module.scss";

type Props = {};

const Dashboard: React.FC<Props> = (props) => {

  const [recent, setRecent] = useState<any>({});
  const [saved, setSaved] = useState<any>({});
  const [summary, setSummary] = useState<any>({});

  useEffect(() => {
    setRecent(getRecent({}));
    setSaved(getSaved({}));
    setSummary(getSummary({}));
  }, []);

  return (
    <div className={styles.dashboard}>
      <div className="dashboard container-fluid">

        <div className="row">

          <Metrics data={summary.metrics} config={configDashboard.metrics} />

        </div>

        <div className="row">

          <div className="col-lg">

            <Section title="Search">
              <div className={styles.newSearch}>
                <h4 style={{marginBottom: "20px"}}>New Search</h4>
                <SearchBox config={configSearchbox} button="vertical" width="100%" />
              </div>
              <div className={styles.divider}>- or -</div>
              <div style={{marginTop: "20px"}}>
                <h4>Saved Searches</h4>
                <Saved data={saved} config={configDashboard.saved} />
              </div>
            </Section>

          </div>

          <div className="col-lg">

            <Section title="What's New with Entities">
              <New />
            </Section>

            <Section title="Recently Visited">
              <Recent data={recent} config={configDashboard.recent} />
            </Section>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
