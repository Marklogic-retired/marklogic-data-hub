import React, {useState} from "react";
import styles from "./overflow-tooltip.module.scss";
import {OverflowDetector} from "react-overflow";
import {Tooltip} from "antd";


export const OverflowTooltip = (props) => {
  const [isOverflowed, setisOverflowed] = useState(false);
  const handleOverflowChange = (isOverflowed) => setisOverflowed(isOverflowed);

  return (
    <OverflowDetector onOverflowChange={handleOverflowChange} className={styles.overflow} style={{width: props.width}}>
      <Tooltip title={isOverflowed && props.title} placement={props.placement} >{props.content}</Tooltip>
    </OverflowDetector>
  );
};