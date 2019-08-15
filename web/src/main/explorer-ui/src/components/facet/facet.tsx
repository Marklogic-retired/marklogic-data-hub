import React from 'react';
import { Checkbox, Icon } from 'antd';
import styles from './facet.module.scss';

const Facet = (props) => {

  const values = props.data.facetValues.map((f, i) =>
    <div key={i}>
      <div className={styles.check}><Checkbox></Checkbox></div>
      <div className={styles.value}>{f.value}</div>
      <div className={styles.count}>{f.count}</div>
    </div>
  );

  return (
    <div className={styles.facetContainer}>
      <div className={styles.header}>
        <div className={styles.name}>{props.name}</div>
        <div className={styles.summary}>
          <div className={styles.selected}>0 selected</div>
          <div className={styles.clear}>Clear</div>
          <div className={styles.toggle}><Icon style={{fontSize: '12px'}} type="up" /></div>
        </div>
      </div>
      {values}
    </div>
  )
}

export default Facet;