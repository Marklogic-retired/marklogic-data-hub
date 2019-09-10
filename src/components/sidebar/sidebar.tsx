import React from 'react';
import Facets from '../facets/facets';
import hubPropertiesConfig from '../../config/hub-properties.config';
import styles from './sidebar.module.scss';

const Sidebar = (props) => {

  const handleFacetClick = (constraint, vals) => {
    props.onFacetClick(constraint, vals);
  }

  let hubFacets = {};
  let sortedHubFacets = {};
  let entityFacets = {};

  if (props.facets) {
    // If not hub facet, then entity facet
    Object.keys(props.facets).forEach(prop => {
      if (hubPropertiesConfig[prop]) {
        hubFacets[prop] = props.facets[prop];
      } else {
        entityFacets[prop] = props.facets[prop];
      }
    })
    // Sort hub facets in config order
    Object.keys(hubPropertiesConfig).forEach(prop => {
      if (hubFacets[prop]) {
        sortedHubFacets[prop] = hubFacets[prop];
      }
    })
  }

  return (
    <div className={styles.sidebarContainer}>
      <Facets 
        title="Entity Properties"
        data={entityFacets}
        onFacetClick={handleFacetClick}
      />
      <Facets 
        title="Hub Properties"
        data={sortedHubFacets}
        onFacetClick={handleFacetClick}
      />
    </div>
  );
}

export default Sidebar;