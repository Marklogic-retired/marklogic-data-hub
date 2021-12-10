import React from "react";
import Timeline from "react-visjs-timeline";
import "./timeline-vis.scss";

interface Props {
    items: any;
    options: any;
    clickHandler: (event: any) => void;
    borderMargin: string;
}
const TimelineVis: React.FC<Props> = (props) => {

  return (
    <div style={{paddingTop: "10px", paddingLeft: props.borderMargin, paddingRight: props.borderMargin}}>
      <Timeline items={props.items} options={props.options} clickHandler={props.clickHandler}></Timeline>
    </div>
  );
};

export default TimelineVis;
