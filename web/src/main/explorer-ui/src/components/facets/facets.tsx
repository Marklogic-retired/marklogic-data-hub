import React, { useState } from 'react';
import { Icon } from 'antd';
import Facet from '../facet/facet';
import styles from './facets.module.scss';

const Facets = (props) => {

  const keys = Object.keys(props.data.facets);
  const facets = keys.map((k, i) =>
    <Facet
      name={k}
      data={props.data.facets[k]}
      key={i}
    />
  );

  const [show, toggleShow] = useState(true);

  return (
    <div className={styles.facetsContainer}>
      <div className={styles.header}>
        <div className={styles.title}>{props.title}</div>
        <div className={styles.toggle} onClick={() => toggleShow(!show)}>
          <Icon style={{fontSize: '12px'}} type={(show) ? 'up' : 'down'} />
        </div>
      </div>
      <div style={{display: (show) ? 'block' : 'none'}}>
        {facets}
      </div>
    </div>
  )
}

export default Facets;