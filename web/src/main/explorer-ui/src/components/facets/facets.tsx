import React from 'react';
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

  return (
    <div className={styles.facetsContainer}>
      <div className={styles.header}>
        <div className={styles.title}>{props.title}</div>
        <div className={styles.toggle}><Icon style={{fontSize: '12px'}} type="up" /></div>
      </div>
      {facets}
    </div>
  )
}

export default Facets;