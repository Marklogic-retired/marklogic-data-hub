import React, { useState } from 'react';
import { Icon } from 'antd';
import Facet from '../facet/facet';
import styles from './facets.module.scss';

const Facets = (props) => {
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
      { props.facets.length && props.facets.map((facet, index) => {
        return facet && (
          <Facet
            name={facet.hasOwnProperty('displayName') ? facet.displayName : facet.facetName}
            constraint={facet.facetName}
            facetValues={facet.facetValues}
            key={facet.facetName}
          />
          )
         })}
      </div>
    </div>
  )
}

export default Facets;