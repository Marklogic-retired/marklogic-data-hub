import React from "react";
import Metric from "./Metric";
// import "./Metrics.scss";
import _ from "lodash";

type Props = {
  data?: any;
  config?: any
};

/**
 * Component for showing summary statistics for the application.
 *
 * @component
 * @prop {object} data - Data payload.
 * @prop {object[]} config  Array of metric configuration objects.
 * @prop {string} config[].title - Metric label.
 * @prop {string} config[].path - Path to metric value in payload.
 * @prop {string} config[].color - HTML color code for container.
 * @example
 * [
 *   {
 *      title: "New data this week",
 *      path: "path.to.metric",
 *      color: "#ff0000"
 *   }
 * ]
 */
const Metrics: React.FC<Props> = (props) => {

  return (
    <div className="row metrics">
      {_.isArray(props.config.items) && props.config.items.map((m, i) =>
          <Metric key={"metric-" + i} data={props.data} config={m} />
      )}
    </div>
  );
};

export default Metrics;
