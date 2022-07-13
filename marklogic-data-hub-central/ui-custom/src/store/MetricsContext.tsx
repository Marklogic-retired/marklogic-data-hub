import React, { useState, useContext } from 'react';
import {UserContext} from "../store/UserContext";
import { getMetrics } from "../api/api";

interface MetricsContextInterface {
    metrics: any;
    whatsNew: any;
    handleGetMetrics: any;
    handleGetWhatsNew: any;
}
  
const defaultState = {
    metrics: {},
    whatsNew: {},
    handleGetMetrics: () => {},
    handleGetWhatsNew: () => {},
};

/**
 * Component for storing state for summary information about the app.
 *
 * @component
 * @prop {string} userid - User UUID value.
 * @prop {handleLogin} handleDetail - Method for requesting UUID from login endpoint. 
 * @example
 * TBD
 */
export const MetricsContext = React.createContext<MetricsContextInterface>(defaultState);

const MetricsProvider: React.FC = ({ children }) => {

    const userContext = useContext(UserContext);

    const [metrics, setMetrics] = useState<any>({});
    const [whatsNew, setWhatsNew] = useState<any>({});

    const handleGetMetrics = () => {
      // If not configured, don't execute
      if (!(userContext?.config?.dashboard?.metrics?.config?.items?.length > 0)) return;
      const body = userContext.config.dashboard.metrics.config.items.map(item => {
        return {type: item.type, period: item.period}
      });
      let sr = getMetrics(userContext.config.api.metricsEndpoint, body, userContext.userid);
      sr.then(result => {
          // Add returned values to config objects
          if (result && result.data) {
              setMetrics(result.data);
          }
      }).catch(error => {
          console.error(error);
      })
    };

    const handleGetWhatsNew = (period) => {
      // If not configured, don't execute
      if (!(userContext?.config?.dashboard?.whatsNew?.config?.items?.length > 0) ||
        !(userContext?.config?.dashboard?.whatsNew?.config?.menu?.length > 0)) return;
      if (!period) {
          // If period not supplied, get default period from config
          let menuItems = userContext.config.dashboard.whatsNew.config.menu;
          let found = menuItems.find(item => item.default === true);
          period = found ? found.period : menuItems[0].period;
      }
      const body = userContext.config.dashboard.whatsNew.config.items.map(item => {
        return {type: item.type, period: period}
      });
      let sr = getMetrics(userContext.config.api.whatsNewEndpoint, body, userContext.userid);
      sr.then(result => {
          // Add returned values to config objects
          if (result && result.data) {
              setWhatsNew(result.data);
          }
      }).catch(error => {
          console.error(error);
      })
    };

    return (
      <MetricsContext.Provider
        value={{
          metrics,
          whatsNew,
          handleGetMetrics,
          handleGetWhatsNew
        }}
      >
        {children}
      </MetricsContext.Provider>
    );
};

export default MetricsProvider;