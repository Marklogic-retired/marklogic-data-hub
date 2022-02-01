import React from "react";
import Metric from "./Metric";
import styles from "./Metrics.module.scss";
import _ from "lodash";

type Props = {
  data: any;
  config: any
};

/**
 * Component for showing summary statistics for the application.
 *
 * @component
 * @prop {object} data - Data payload.
 * @prop {object[]} config  Array of metric configuration objects.
 * @prop {string} config[].title - Metric label.
 * @prop {string} config[].value - Path to metric value in payload.
 * @prop {string} config[].color - HTML color code for container.
 * @example
 * [
 *   {
 *      title: "New data this week",
 *      value: "path.to.metric",
 *      color: "#ff0000"
 *   }
 * ]
 */
const Metrics: React.FC<Props> = (props) => {

  return (
    <div className={styles.metrics}>
      {_.isArray(props.config) && props.config.map((m, i) => {
        return (
          <Metric key={"metric-" + i} data={props.data} config={m} />
        );
      })}
    </div>
  );
};

export default Metrics;
