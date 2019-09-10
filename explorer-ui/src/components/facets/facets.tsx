import React, { useState } from 'react';
import { Icon } from 'antd';
import Facet from '../facet/facet';
import hubPropertiesConfig from '../../config/hub-properties.config';
import styles from './facets.module.scss';

const Facets = (props) => {

  const handleFacetClick = (constraint, vals) => {
    props.onFacetClick(constraint, vals);
  }

  let facets: any = [];

  if (props.data) {
    facets = Object.keys(props.data).map((k, i) => {
      let name = hubPropertiesConfig[k] ? hubPropertiesConfig[k].name : k;
      return (
        <Facet
          constraint={k}
          name={name}
          data={props.data[k]}
          key={i}
          onFacetClick={handleFacetClick}
        />
      )
    });
  }

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