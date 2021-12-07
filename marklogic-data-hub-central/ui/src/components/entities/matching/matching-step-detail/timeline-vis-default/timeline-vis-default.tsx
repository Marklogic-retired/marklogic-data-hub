import React from "react";
import Timeline from "react-visjs-timeline";
import "../../matching-step-detail/timeline-vis/timeline-vis.scss";

interface Props {
    items: any;
    options: any;
    borderMargin: string;
}
const TimelineVisDefault: React.FC<Props> = (props) => {

  return (
    <div style={{paddingTop: "10px", paddingLeft: props.borderMargin, paddingRight: props.borderMargin}}>
      <Timeline items={props.items} options={props.options}></Timeline>
    </div>
  );
};

export default TimelineVisDefault;
