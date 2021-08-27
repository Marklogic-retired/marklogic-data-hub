import React from "react";
import styles from "./hc-divider.module.scss";

interface Props {
  type?: "horizontal" | "vertical";
  className?: string;
  dashed?: boolean;
  style?: React.CSSProperties;
}

const HCDivider: React.FC<Props> = (props) => {
  return (
    <div data-testid="divider-component">
      <hr className={[
        props.type === "vertical" ? styles.vl : styles.hl,
        props.className ? props.className : "",
        props.dashed ? props.type === "vertical" ? styles.dashedVertical : styles.dashedHorizontal : "",
      ].join(" ")} style={props.style}>
      </hr>
    </div>
  );
};

export default HCDivider;