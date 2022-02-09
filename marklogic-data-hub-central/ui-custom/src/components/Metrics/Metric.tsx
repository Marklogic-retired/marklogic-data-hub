import React from "react";
import "./Metric.scss";
import { getValByPath } from "../../util/util";
import _ from "lodash";

type Props = {
  data?: any;
  config?: any
};

const Metric: React.FC<Props> = (props) => {

  function display(res, key) {
    let val = getValByPath(res, key);
    return _.isNumber(val) ? val.toLocaleString() : val;
  }

  return (
    <div className="metric" style={{borderColor: props.config.color}}>
      <div className="value">{display(props.data, props.config.path)}</div>
      <div className="title">{props.config.title}</div>
    </div>
  );
};

export default Metric;
