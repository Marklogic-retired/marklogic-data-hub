import React from "react";
import "./Metric.scss";
import { getValByPath } from "../../util/util";
import _ from "lodash";

type Props = {
  data?: any;
  config?: any
};

const Metric: React.FC<Props> = (props) => {

  let val = _.get(props.data, props.config.path, null);
  let valFmt = _.isNumber(val) ? val.toLocaleString() : val;

  return (
    <div className="metric" style={{borderColor: props.config.color}}>
      <div className="value">{valFmt}</div>
      <div className="title">{props.config.title}</div>
    </div>
  );

};

export default Metric;
