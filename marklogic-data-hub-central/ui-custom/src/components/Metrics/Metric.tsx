import React from "react";
import styles from "./Metric.module.scss";
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
    <div className={styles.metric} style={{borderColor: props.config.color}}>
      <div className={styles.value}>{display(props.data, props.config.value)}</div>
      <div className={styles.title}>{props.config.title}</div>
    </div>
  );
};

export default Metric;
