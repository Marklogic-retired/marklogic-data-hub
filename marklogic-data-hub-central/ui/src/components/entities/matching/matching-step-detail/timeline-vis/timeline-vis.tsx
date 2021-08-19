import React from "react";
import Timeline from "react-visjs-timeline";
import "./timeline-vis.scss";
import styles from "./timeline-vis.module.scss";

interface Props {
    items: any;
    options: any;
    clickHandler: (event: any) => void;
}
const TimelineVis: React.FC<Props> = (props) => {

  return (
    <div className={styles.timelineContainer}>
      <Timeline items={props.items} options={props.options} clickHandler={props.clickHandler}></Timeline>
    </div>
  );
};

export default TimelineVis;
