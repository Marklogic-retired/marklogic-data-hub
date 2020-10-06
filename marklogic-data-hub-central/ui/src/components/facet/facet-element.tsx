import React, { useState } from 'react';
import styles from './facet.module.scss';
import { numberConverter } from '../../util/number-conversion';
import { stringConverter } from '../../util/string-conversion';
import { MLTooltip, MLCheckbox } from '@marklogic/design-system';
import { OverflowDetector } from 'react-overflow';


export const FacetName = (props) => {
  const [isOverflowed, setisOverflowed] = useState(false);
  const handleOverflowChange = (isOverflowed) => setisOverflowed(isOverflowed);

  return (
    <div className={styles.checkContainer} key={props.index} data-testid={props.facet.value} data-cy={stringConverter(props.name) + "-facet-item"}>
      <OverflowDetector onOverflowChange={handleOverflowChange} style={{ width: '180px' }}>
        <div id={props.facet.value + '-tooltipContainer'}>
        <MLCheckbox
          value={props.facet.value}
          onChange={(e) => props.handleClick(e)}
          checked={props.checked.includes(props.facet.value)}
          className={styles.value}
          data-testid={`${stringConverter(props.name)}-${props.facet.value}-checkbox`}
        >
          <MLTooltip title={isOverflowed && props.facet.value} id={props.facet.value + '-tooltip'} getPopupContainer={() => document.getElementById(props.facet.value + '-tooltipContainer')}>{props.facet.value}</MLTooltip>
        </MLCheckbox>
        </div>
      </OverflowDetector>
      <div className={styles.count}
        data-cy={`${stringConverter(props.name)}-${props.facet.value}-count`}>{numberConverter(props.facet.count)}</div>
    </div>
  );
};