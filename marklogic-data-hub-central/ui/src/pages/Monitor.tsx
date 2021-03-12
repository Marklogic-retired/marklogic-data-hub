import React, {useContext} from "react";
import styles from "./Monitor.module.scss";
import {AuthoritiesContext} from "../util/authorities";
import tiles from "../config/tiles.config";
import {MissingPagePermission} from "../config/messages.config";

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
  </div>
  );

};

export default Monitor;
