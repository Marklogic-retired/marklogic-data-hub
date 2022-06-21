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
    <div className="col-md-3 mb-3">
      <div className="metric h-100 card card-body" style={{ borderColor: props.config.color }}>
        <div className="value fs-3">{valFmt}</div>
        <div className="small title">{props.config.title}</div>
      </div>
    </div>
  );

};

export default Metric;
