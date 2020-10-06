import React, { useState } from 'react';
import styles from './overflow-tooltip.module.scss';
import { MLTooltip } from '@marklogic/design-system';
import { OverflowDetector } from 'react-overflow';


export const OverflowTooltip = (props) => {
  const [isOverflowed, setisOverflowed] = useState(false);
  const handleOverflowChange = (isOverflowed) => setisOverflowed(isOverflowed);

  return (
    <OverflowDetector onOverflowChange={handleOverflowChange} className={styles.overflow} style={{ width: props.width }}>
        <MLTooltip title={isOverflowed && props.title} placement={props.placement} >{props.content}</MLTooltip>
    </OverflowDetector>
  );
}; 