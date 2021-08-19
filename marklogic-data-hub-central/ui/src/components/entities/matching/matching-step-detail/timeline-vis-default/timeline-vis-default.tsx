import React from "react";
import Timeline from "react-visjs-timeline";
import "../../matching-step-detail/timeline-vis/timeline-vis.scss";
import styles from "../../matching-step-detail/timeline-vis/timeline-vis.module.scss";

interface Props {
    items: any;
    options: any;
}
const TimelineVisDefault: React.FC<Props> = (props) => {

  return (
    <div className={styles.timelineContainer}>
      <Timeline items={props.items} options={props.options}></Timeline>
    </div>
  );
};

export default TimelineVisDefault;
